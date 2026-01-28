-- Migration 007: Fonction pour récupérer les locations avec coordonnées extraites
-- Résout le problème du format WKB retourné par PostGIS

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

-- Donner les permissions
GRANT EXECUTE ON FUNCTION get_locations_with_coords TO anon, authenticated;



