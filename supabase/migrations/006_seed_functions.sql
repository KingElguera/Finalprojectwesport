-- Migration 006: Fonctions helper pour le script de seed des terrains
-- Crée des fonctions SQL pour faciliter l'insertion et la vérification des doublons

-- Fonction pour vérifier si un terrain existe déjà dans un rayon donné
CREATE OR REPLACE FUNCTION check_location_exists(
  p_lat DOUBLE PRECISION,
  p_lon DOUBLE PRECISION,
  p_tolerance INTEGER DEFAULT 50
)
RETURNS BOOLEAN AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM locations
  WHERE ST_DWithin(
    coordinates,
    ST_SetSRID(ST_MakePoint(p_lon, p_lat), 4326)::geography,
    p_tolerance
  );
  
  RETURN v_count > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour insérer un terrain avec coordonnées PostGIS
CREATE OR REPLACE FUNCTION insert_location_with_coords(
  p_name TEXT,
  p_type TEXT,
  p_lat DOUBLE PRECISION,
  p_lon DOUBLE PRECISION,
  p_address TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_location_id UUID;
BEGIN
  INSERT INTO locations (name, type, coordinates, address)
  VALUES (
    p_name,
    p_type,
    ST_SetSRID(ST_MakePoint(p_lon, p_lat), 4326)::geography,
    p_address
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_location_id;
  
  RETURN v_location_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour récupérer les locations avec coordonnées extraites
CREATE OR REPLACE FUNCTION get_locations_with_coords()
RETURNS TABLE (
  id UUID,
  name TEXT,
  type TEXT,
  address TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    l.id,
    l.name,
    l.type,
    l.address,
    l.image_url,
    l.created_at,
    l.updated_at,
    ST_Y(l.coordinates::geometry) as lat,
    ST_X(l.coordinates::geometry) as lng
  FROM locations l
  ORDER BY l.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Donner les permissions nécessaires
GRANT EXECUTE ON FUNCTION check_location_exists TO anon, authenticated;
GRANT EXECUTE ON FUNCTION insert_location_with_coords TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_locations_with_coords TO anon, authenticated;

