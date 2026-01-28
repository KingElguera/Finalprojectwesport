-- Migration 005: Données de test pour les lieux sportifs
-- Insère quelques lieux de test pour tester la carte interactive

-- Insérer quelques lieux sportifs de test à Paris
INSERT INTO locations (name, type, coordinates, address) VALUES
  (
    'Terrain de Basket République',
    'basketball',
    ST_SetSRID(ST_MakePoint(2.3636, 48.8676), 4326)::geography,
    'Place de la République, 75003 Paris'
  ),
  (
    'Stade de Football Champs-Élysées',
    'soccer',
    ST_SetSRID(ST_MakePoint(2.3080, 48.8738), 4326)::geography,
    'Avenue des Champs-Élysées, 75008 Paris'
  ),
  (
    'Salle de Sport Opéra',
    'gym',
    ST_SetSRID(ST_MakePoint(2.3317, 48.8708), 4326)::geography,
    'Place de l''Opéra, 75009 Paris'
  ),
  (
    'Court de Tennis Luxembourg',
    'tennis',
    ST_SetSRID(ST_MakePoint(2.3372, 48.8462), 4326)::geography,
    'Jardin du Luxembourg, 75006 Paris'
  ),
  (
    'Parcours Running Seine',
    'running',
    ST_SetSRID(ST_MakePoint(2.3522, 48.8566), 4326)::geography,
    'Quai de la Seine, 75004 Paris'
  )
ON CONFLICT DO NOTHING;

