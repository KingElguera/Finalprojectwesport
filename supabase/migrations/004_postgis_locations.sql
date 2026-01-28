-- Migration 004: PostGIS et tables de géolocalisation
-- Active l'extension PostGIS et crée les tables pour la fonctionnalité de carte interactive

-- 1. Activer l'extension PostGIS (indispensable pour gérer les coordonnées GPS)
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Créer la table locations (lieux sportifs)
CREATE TABLE IF NOT EXISTS locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  coordinates geography(Point, 4326) NOT NULL,
  address TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Créer la table checkins (présences utilisateurs)
CREATE TABLE IF NOT EXISTS checkins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  location_id UUID REFERENCES public.locations(id) ON DELETE CASCADE NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  is_public BOOLEAN DEFAULT true,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Créer les index pour optimiser les performances
-- Index GIST sur coordinates pour les requêtes spatiales rapides
CREATE INDEX IF NOT EXISTS idx_locations_coordinates ON locations USING GIST (coordinates);

-- Index sur les foreign keys pour améliorer les jointures
CREATE INDEX IF NOT EXISTS idx_checkins_user_id ON checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_checkins_location_id ON checkins(location_id);
CREATE INDEX IF NOT EXISTS idx_checkins_start_time ON checkins(start_time DESC);

-- 5. Activer RLS sur les tables
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;

-- 6. Politiques RLS pour locations
-- Lecture publique pour tous
CREATE POLICY "Les lieux sont visibles publiquement"
  ON locations FOR SELECT
  USING (true);

-- Écriture restreinte (admin seulement pour l'instant)
-- Note: Cette politique peut être modifiée plus tard pour permettre aux utilisateurs de créer des lieux
-- Pour l'instant, seuls les admins peuvent créer/modifier/supprimer des lieux
-- (nécessite une fonction helper ou un rôle admin à définir ultérieurement)

-- 7. Politiques RLS pour checkins
-- INSERT : Un utilisateur ne peut créer un checkin que pour son propre user_id
CREATE POLICY "Les utilisateurs peuvent créer leurs propres checkins"
  ON checkins FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- SELECT : Visible si c'est le mien OU s'il est public
CREATE POLICY "Les checkins sont visibles si publics ou si c'est le mien"
  ON checkins FOR SELECT
  USING ((auth.uid() = user_id) OR (is_public = true));

-- UPDATE : Un utilisateur peut modifier seulement ses propres checkins
CREATE POLICY "Les utilisateurs peuvent modifier leurs propres checkins"
  ON checkins FOR UPDATE
  USING (auth.uid() = user_id);

-- DELETE : Un utilisateur peut supprimer seulement ses propres checkins
CREATE POLICY "Les utilisateurs peuvent supprimer leurs propres checkins"
  ON checkins FOR DELETE
  USING (auth.uid() = user_id);

-- 8. Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour mettre à jour updated_at
DROP TRIGGER IF EXISTS trigger_update_locations_updated_at ON locations;
CREATE TRIGGER trigger_update_locations_updated_at
  BEFORE UPDATE ON locations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_checkins_updated_at ON checkins;
CREATE TRIGGER trigger_update_checkins_updated_at
  BEFORE UPDATE ON checkins
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

