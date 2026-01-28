-- Créer les buckets si ils n'existent pas déjà
-- Note: Ces commandes doivent être exécutées manuellement dans Supabase Dashboard > Storage
-- car CREATE BUCKET n'est pas disponible dans les migrations SQL standard

-- Policies pour le bucket 'avatars'
CREATE POLICY "Les avatars sont visibles publiquement"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Les utilisateurs peuvent télécharger leur avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Les utilisateurs peuvent modifier leur avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Les utilisateurs peuvent supprimer leur avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policies pour le bucket 'posts'
CREATE POLICY "Les posts sont visibles publiquement"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'posts');

CREATE POLICY "Les utilisateurs connectés peuvent télécharger des posts"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'posts');

CREATE POLICY "Les utilisateurs peuvent modifier leurs posts"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'posts' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Les utilisateurs peuvent supprimer leurs posts"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'posts' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

