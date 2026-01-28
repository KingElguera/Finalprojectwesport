-- Migration 008: Fonction RPC pour récupérer les lieux avec leur popularité
-- Cette fonction retourne les lieux avec le nombre total de check-ins et le nombre actif

CREATE OR REPLACE FUNCTION get_locations_with_popularity()
RETURNS TABLE (
  id UUID,
  name TEXT,
  type TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  address TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  checkins_count BIGINT,
  active_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    l.id,
    l.name,
    l.type,
    ST_Y(l.coordinates::geometry) as lat,
    ST_X(l.coordinates::geometry) as lng,
    l.address,
    l.image_url,
    l.created_at,
    l.updated_at,
    COALESCE(total.count, 0) as checkins_count,
    COALESCE(active.count, 0) as active_count
  FROM locations l
  LEFT JOIN (
    -- Compte total des check-ins par lieu
    SELECT location_id, COUNT(*) as count
    FROM checkins
    WHERE is_public = true
    GROUP BY location_id
  ) total ON l.id = total.location_id
  LEFT JOIN (
    -- Compte des check-ins actifs (sans end_time)
    SELECT location_id, COUNT(*) as count
    FROM checkins
    WHERE is_public = true AND end_time IS NULL
    GROUP BY location_id
  ) active ON l.id = active.location_id
  ORDER BY checkins_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

