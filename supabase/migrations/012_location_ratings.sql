-- Migration 012: Système de notation pour les lieux sportifs
-- Permet aux utilisateurs de noter les lieux de 1 à 5 étoiles

-- 1. Créer la table des notations
CREATE TABLE IF NOT EXISTS location_ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  location_id UUID REFERENCES locations(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Un utilisateur ne peut noter qu'une fois par lieu (mais peut modifier sa note)
  UNIQUE(user_id, location_id)
);

-- 2. Index pour les performances
CREATE INDEX IF NOT EXISTS idx_location_ratings_location_id ON location_ratings(location_id);
CREATE INDEX IF NOT EXISTS idx_location_ratings_user_id ON location_ratings(user_id);

-- 3. Activer RLS
ALTER TABLE location_ratings ENABLE ROW LEVEL SECURITY;

-- 4. Politiques RLS
-- Lecture publique (tout le monde peut voir les notes)
CREATE POLICY "Les notes sont visibles publiquement"
  ON location_ratings FOR SELECT
  USING (true);

-- Insertion : utilisateurs authentifiés peuvent ajouter leur note
CREATE POLICY "Les utilisateurs authentifiés peuvent noter"
  ON location_ratings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Mise à jour : seulement sa propre note
CREATE POLICY "Les utilisateurs peuvent modifier leur note"
  ON location_ratings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Suppression : seulement sa propre note
CREATE POLICY "Les utilisateurs peuvent supprimer leur note"
  ON location_ratings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 5. Fonction pour obtenir la moyenne et le nombre de notes d'un lieu
CREATE OR REPLACE FUNCTION get_location_rating_stats(p_location_id UUID)
RETURNS TABLE (
  average_rating NUMERIC,
  ratings_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ROUND(AVG(rating)::numeric, 1) as average_rating,
    COUNT(*) as ratings_count
  FROM location_ratings
  WHERE location_id = p_location_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Donner les permissions
GRANT EXECUTE ON FUNCTION get_location_rating_stats TO anon, authenticated;

