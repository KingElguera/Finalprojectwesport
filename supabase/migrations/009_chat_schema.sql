-- =============================================
-- CHAT SCHEMA - Tables pour la messagerie
-- =============================================

-- Table des conversations (privées ou de groupe)
CREATE TABLE IF NOT EXISTS conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('direct', 'group')),
  name TEXT, -- Nom du groupe (null pour les conversations directes)
  image_url TEXT, -- Image du groupe (null pour les conversations directes)
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des participants aux conversations
CREATE TABLE IF NOT EXISTS conversation_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_admin BOOLEAN DEFAULT FALSE, -- Admin du groupe (pour les groupes)
  UNIQUE(conversation_id, user_id)
);

-- Table des messages
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  content TEXT, -- Contenu textuel (peut être null si média uniquement)
  media_url TEXT, -- URL du média (image)
  media_type TEXT CHECK (media_type IS NULL OR media_type IN ('image', 'video')),
  is_deleted BOOLEAN DEFAULT FALSE, -- Pour soft delete
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des indicateurs de saisie (typing indicators)
-- Utilise une table éphémère pour le temps réel
CREATE TABLE IF NOT EXISTS typing_indicators (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  is_typing BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(conversation_id, user_id)
);

-- =============================================
-- INDEX pour améliorer les performances
-- =============================================

CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation_id ON conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user_id ON conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_typing_indicators_conversation_id ON typing_indicators(conversation_id);

-- =============================================
-- FONCTIONS ET TRIGGERS
-- =============================================

-- Fonction pour mettre à jour le timestamp updated_at des conversations
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations 
  SET updated_at = NOW() 
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour la conversation quand un nouveau message est envoyé
DROP TRIGGER IF EXISTS trigger_update_conversation_on_message ON messages;
CREATE TRIGGER trigger_update_conversation_on_message
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION update_conversation_timestamp();

-- Fonction pour nettoyer les indicateurs de saisie expirés (plus de 10 secondes)
CREATE OR REPLACE FUNCTION cleanup_typing_indicators()
RETURNS void AS $$
BEGIN
  DELETE FROM typing_indicators 
  WHERE updated_at < NOW() - INTERVAL '10 seconds';
END;
$$ LANGUAGE plpgsql;

-- Fonction pour trouver ou créer une conversation directe entre deux utilisateurs
CREATE OR REPLACE FUNCTION find_or_create_direct_conversation(user1_id UUID, user2_id UUID)
RETURNS UUID AS $$
DECLARE
  existing_conversation_id UUID;
  new_conversation_id UUID;
BEGIN
  -- Chercher une conversation directe existante entre ces deux utilisateurs
  SELECT c.id INTO existing_conversation_id
  FROM conversations c
  WHERE c.type = 'direct'
    AND EXISTS (
      SELECT 1 FROM conversation_participants cp1 
      WHERE cp1.conversation_id = c.id AND cp1.user_id = user1_id
    )
    AND EXISTS (
      SELECT 1 FROM conversation_participants cp2 
      WHERE cp2.conversation_id = c.id AND cp2.user_id = user2_id
    )
    AND (
      SELECT COUNT(*) FROM conversation_participants cp 
      WHERE cp.conversation_id = c.id
    ) = 2
  LIMIT 1;

  -- Si une conversation existe, la retourner
  IF existing_conversation_id IS NOT NULL THEN
    RETURN existing_conversation_id;
  END IF;

  -- Sinon, créer une nouvelle conversation
  INSERT INTO conversations (type, created_by)
  VALUES ('direct', user1_id)
  RETURNING id INTO new_conversation_id;

  -- Ajouter les deux participants
  INSERT INTO conversation_participants (conversation_id, user_id)
  VALUES (new_conversation_id, user1_id), (new_conversation_id, user2_id);

  RETURN new_conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour obtenir le nombre de messages non lus pour une conversation
CREATE OR REPLACE FUNCTION get_unread_count(p_conversation_id UUID, p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  last_read TIMESTAMP WITH TIME ZONE;
  unread_count INTEGER;
BEGIN
  -- Obtenir le dernier timestamp de lecture
  SELECT last_read_at INTO last_read
  FROM conversation_participants
  WHERE conversation_id = p_conversation_id AND user_id = p_user_id;

  -- Compter les messages non lus (envoyés après last_read_at et pas par l'utilisateur)
  SELECT COUNT(*) INTO unread_count
  FROM messages
  WHERE conversation_id = p_conversation_id
    AND sender_id != p_user_id
    AND created_at > COALESCE(last_read, '1970-01-01'::timestamp with time zone)
    AND is_deleted = FALSE;

  RETURN unread_count;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir les conversations d'un utilisateur avec les détails
CREATE OR REPLACE FUNCTION get_user_conversations(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  type TEXT,
  name TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  last_message_content TEXT,
  last_message_sender_id UUID,
  last_message_created_at TIMESTAMP WITH TIME ZONE,
  unread_count INTEGER,
  other_participant_id UUID,
  other_participant_username TEXT,
  other_participant_avatar TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.type,
    c.name,
    c.image_url,
    c.created_at,
    c.updated_at,
    lm.content AS last_message_content,
    lm.sender_id AS last_message_sender_id,
    lm.created_at AS last_message_created_at,
    get_unread_count(c.id, p_user_id) AS unread_count,
    -- Pour les conversations directes, obtenir l'autre participant
    CASE 
      WHEN c.type = 'direct' THEN (
        SELECT cp2.user_id 
        FROM conversation_participants cp2 
        WHERE cp2.conversation_id = c.id AND cp2.user_id != p_user_id 
        LIMIT 1
      )
      ELSE NULL
    END AS other_participant_id,
    CASE 
      WHEN c.type = 'direct' THEN (
        SELECT p.username 
        FROM conversation_participants cp2 
        JOIN profiles p ON p.id = cp2.user_id
        WHERE cp2.conversation_id = c.id AND cp2.user_id != p_user_id 
        LIMIT 1
      )
      ELSE NULL
    END AS other_participant_username,
    CASE 
      WHEN c.type = 'direct' THEN (
        SELECT p.avatar_url 
        FROM conversation_participants cp2 
        JOIN profiles p ON p.id = cp2.user_id
        WHERE cp2.conversation_id = c.id AND cp2.user_id != p_user_id 
        LIMIT 1
      )
      ELSE NULL
    END AS other_participant_avatar
  FROM conversations c
  INNER JOIN conversation_participants cp ON cp.conversation_id = c.id
  LEFT JOIN LATERAL (
    SELECT m.content, m.sender_id, m.created_at
    FROM messages m
    WHERE m.conversation_id = c.id AND m.is_deleted = FALSE
    ORDER BY m.created_at DESC
    LIMIT 1
  ) lm ON TRUE
  WHERE cp.user_id = p_user_id
  ORDER BY COALESCE(lm.created_at, c.updated_at) DESC;
END;
$$ LANGUAGE plpgsql;

