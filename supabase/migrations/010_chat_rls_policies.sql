-- =============================================
-- RLS POLICIES pour le Chat
-- =============================================

-- Activer RLS sur toutes les tables de chat
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE typing_indicators ENABLE ROW LEVEL SECURITY;

-- =============================================
-- POLICIES pour la table conversations
-- =============================================

-- Les utilisateurs peuvent voir les conversations auxquelles ils participent
CREATE POLICY "Users can view their conversations"
  ON conversations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_participants.conversation_id = conversations.id
        AND conversation_participants.user_id = auth.uid()
    )
  );

-- Les utilisateurs peuvent créer des conversations
CREATE POLICY "Users can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Les utilisateurs peuvent mettre à jour les conversations qu'ils ont créées ou dont ils sont admin
CREATE POLICY "Users can update their conversations"
  ON conversations FOR UPDATE
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_participants.conversation_id = conversations.id
        AND conversation_participants.user_id = auth.uid()
        AND conversation_participants.is_admin = TRUE
    )
  );

-- =============================================
-- POLICIES pour la table conversation_participants
-- =============================================

-- Les utilisateurs peuvent voir les participants des conversations auxquelles ils participent
CREATE POLICY "Users can view participants of their conversations"
  ON conversation_participants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = conversation_participants.conversation_id
        AND cp.user_id = auth.uid()
    )
  );

-- Les utilisateurs peuvent s'ajouter comme participant (via trigger ou fonction)
CREATE POLICY "Users can join conversations"
  ON conversation_participants FOR INSERT
  WITH CHECK (
    -- L'utilisateur peut ajouter quelqu'un s'il est le créateur ou admin
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_participants.conversation_id
        AND (
          c.created_by = auth.uid()
          OR EXISTS (
            SELECT 1 FROM conversation_participants cp
            WHERE cp.conversation_id = c.id
              AND cp.user_id = auth.uid()
              AND cp.is_admin = TRUE
          )
        )
    )
    -- Ou si c'est une nouvelle conversation directe
    OR (
      SELECT type FROM conversations WHERE id = conversation_participants.conversation_id
    ) = 'direct'
  );

-- Les utilisateurs peuvent mettre à jour leur propre participation (last_read_at)
CREATE POLICY "Users can update their own participation"
  ON conversation_participants FOR UPDATE
  USING (user_id = auth.uid());

-- Les admins peuvent supprimer des participants
CREATE POLICY "Admins can remove participants"
  ON conversation_participants FOR DELETE
  USING (
    -- L'utilisateur peut se retirer lui-même
    user_id = auth.uid()
    OR
    -- Ou c'est un admin du groupe
    EXISTS (
      SELECT 1 FROM conversation_participants cp
      WHERE cp.conversation_id = conversation_participants.conversation_id
        AND cp.user_id = auth.uid()
        AND cp.is_admin = TRUE
    )
  );

-- =============================================
-- POLICIES pour la table messages
-- =============================================

-- Les utilisateurs peuvent voir les messages des conversations auxquelles ils participent
CREATE POLICY "Users can view messages in their conversations"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_participants.conversation_id = messages.conversation_id
        AND conversation_participants.user_id = auth.uid()
    )
  );

-- Les utilisateurs peuvent envoyer des messages dans les conversations auxquelles ils participent
CREATE POLICY "Users can send messages in their conversations"
  ON messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_participants.conversation_id = messages.conversation_id
        AND conversation_participants.user_id = auth.uid()
    )
  );

-- Les utilisateurs peuvent modifier leurs propres messages (soft delete)
CREATE POLICY "Users can update their own messages"
  ON messages FOR UPDATE
  USING (sender_id = auth.uid());

-- Les utilisateurs peuvent supprimer leurs propres messages
CREATE POLICY "Users can delete their own messages"
  ON messages FOR DELETE
  USING (sender_id = auth.uid());

-- =============================================
-- POLICIES pour la table typing_indicators
-- =============================================

-- Les utilisateurs peuvent voir les indicateurs de saisie dans leurs conversations
CREATE POLICY "Users can view typing indicators in their conversations"
  ON typing_indicators FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_participants.conversation_id = typing_indicators.conversation_id
        AND conversation_participants.user_id = auth.uid()
    )
  );

-- Les utilisateurs peuvent créer leur propre indicateur de saisie
CREATE POLICY "Users can create their own typing indicator"
  ON typing_indicators FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM conversation_participants
      WHERE conversation_participants.conversation_id = typing_indicators.conversation_id
        AND conversation_participants.user_id = auth.uid()
    )
  );

-- Les utilisateurs peuvent mettre à jour leur propre indicateur de saisie
CREATE POLICY "Users can update their own typing indicator"
  ON typing_indicators FOR UPDATE
  USING (user_id = auth.uid());

-- Les utilisateurs peuvent supprimer leur propre indicateur de saisie
CREATE POLICY "Users can delete their own typing indicator"
  ON typing_indicators FOR DELETE
  USING (user_id = auth.uid());

-- =============================================
-- STORAGE POLICIES pour les médias de chat
-- =============================================

-- Note: Le bucket 'chat-media' doit être créé manuellement dans Supabase Dashboard

-- Policy pour permettre aux utilisateurs authentifiés d'uploader des médias
-- INSERT policy for chat-media bucket
-- CREATE POLICY "Authenticated users can upload chat media"
--   ON storage.objects FOR INSERT
--   WITH CHECK (
--     bucket_id = 'chat-media'
--     AND auth.uid() IS NOT NULL
--   );

-- Policy pour permettre aux participants de voir les médias de leurs conversations
-- SELECT policy for chat-media bucket  
-- CREATE POLICY "Users can view chat media in their conversations"
--   ON storage.objects FOR SELECT
--   USING (
--     bucket_id = 'chat-media'
--     AND auth.uid() IS NOT NULL
--   );

-- Policy pour permettre aux utilisateurs de supprimer leurs propres médias
-- DELETE policy for chat-media bucket
-- CREATE POLICY "Users can delete their own chat media"
--   ON storage.objects FOR DELETE
--   USING (
--     bucket_id = 'chat-media'
--     AND (storage.foldername(name))[1] = auth.uid()::text
--   );

