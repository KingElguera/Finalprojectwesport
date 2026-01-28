-- =============================================
-- SHARED POSTS - Ajout du partage de posts dans les messages
-- =============================================

-- Ajouter la colonne shared_post_id à la table messages
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS shared_post_id UUID REFERENCES posts(id) ON DELETE SET NULL;

-- Index pour améliorer les performances des requêtes sur les posts partagés
CREATE INDEX IF NOT EXISTS idx_messages_shared_post_id ON messages(shared_post_id) WHERE shared_post_id IS NOT NULL;

-- Mettre à jour la fonction get_user_conversations pour inclure l'info de post partagé dans le dernier message
-- (La fonction existante fonctionne déjà, car elle récupère juste le contenu du dernier message)

-- Incrémenter le compteur de partages quand un post est partagé
CREATE OR REPLACE FUNCTION increment_share_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.shared_post_id IS NOT NULL THEN
    UPDATE posts 
    SET shares_count = shares_count + 1 
    WHERE id = NEW.shared_post_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour incrémenter le compteur de partages
DROP TRIGGER IF EXISTS trigger_increment_share_count ON messages;
CREATE TRIGGER trigger_increment_share_count
  AFTER INSERT ON messages
  FOR EACH ROW 
  WHEN (NEW.shared_post_id IS NOT NULL)
  EXECUTE FUNCTION increment_share_count();

