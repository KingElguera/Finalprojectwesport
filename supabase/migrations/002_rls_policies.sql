-- Activer RLS sur toutes les tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- PROFILES: Lecture publique, modification seulement par le propriétaire
CREATE POLICY "Les profils sont visibles publiquement"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Les utilisateurs peuvent mettre à jour leur propre profil"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- POSTS: Lecture publique, création/modification/suppression par le propriétaire
CREATE POLICY "Les posts sont visibles publiquement"
  ON posts FOR SELECT
  USING (true);

CREATE POLICY "Les utilisateurs peuvent créer leurs propres posts"
  ON posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent modifier leurs propres posts"
  ON posts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent supprimer leurs propres posts"
  ON posts FOR DELETE
  USING (auth.uid() = user_id);

-- POST_LIKES: Lecture publique, insertion/suppression par l'utilisateur connecté
CREATE POLICY "Les likes sont visibles publiquement"
  ON post_likes FOR SELECT
  USING (true);

CREATE POLICY "Les utilisateurs connectés peuvent liker"
  ON post_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent retirer leur like"
  ON post_likes FOR DELETE
  USING (auth.uid() = user_id);

-- POST_COMMENTS: Lecture publique, création par utilisateur connecté
CREATE POLICY "Les commentaires sont visibles publiquement"
  ON post_comments FOR SELECT
  USING (true);

CREATE POLICY "Les utilisateurs connectés peuvent commenter"
  ON post_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent modifier leurs commentaires"
  ON post_comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent supprimer leurs commentaires"
  ON post_comments FOR DELETE
  USING (auth.uid() = user_id);

-- SAVED_POSTS: Visible et modifiable seulement par le propriétaire
CREATE POLICY "Les utilisateurs voient leurs posts sauvegardés"
  ON saved_posts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent sauvegarder des posts"
  ON saved_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent retirer un post sauvegardé"
  ON saved_posts FOR DELETE
  USING (auth.uid() = user_id);

-- FOLLOWS: Lecture publique, création/suppression par le follower
CREATE POLICY "Les relations de follow sont visibles publiquement"
  ON follows FOR SELECT
  USING (true);

CREATE POLICY "Les utilisateurs peuvent suivre d'autres utilisateurs"
  ON follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Les utilisateurs peuvent se désabonner"
  ON follows FOR DELETE
  USING (auth.uid() = follower_id);

-- NOTIFICATIONS: Visible et modifiable seulement par le destinataire
CREATE POLICY "Les utilisateurs voient leurs propres notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent modifier leurs notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent supprimer leurs notifications"
  ON notifications FOR DELETE
  USING (auth.uid() = user_id);

