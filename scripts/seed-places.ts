import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Charger les variables d'environnement depuis .env.local
dotenv.config({ path: '.env.local' });

// Configuration géographique par défaut (Paris)
const DEFAULT_LAT = 48.8566;
const DEFAULT_LNG = 2.3522;
const DEFAULT_RADIUS_KM = 10; // Rayon en kilomètres

// Configuration Overpass API
const OVERPASS_API_URL = 'https://overpass-api.de/api/interpreter';

// Configuration des sports à récupérer
interface SportConfig {
  id: string;
  osm_tag: string;
  osm_value: string;
  label: string;
}

const TARGET_SPORTS: SportConfig[] = [
  // Le Foot à 5
  { id: 'soccer', osm_tag: 'sport', osm_value: 'five-a-side', label: 'Five' },
  // Le Basket
  { id: 'basketball', osm_tag: 'sport', osm_value: 'basketball', label: 'Basket' },
  // Les autres sports demandés
  { id: 'tennis', osm_tag: 'sport', osm_value: 'tennis', label: 'Tennis' },
  { id: 'padel', osm_tag: 'sport', osm_value: 'padel', label: 'Padel' },
  { id: 'gym', osm_tag: 'leisure', osm_value: 'fitness_centre', label: 'Salle de Sport' },
  { id: 'running', osm_tag: 'leisure', osm_value: 'track', label: 'Piste Athlé' },
  { id: 'workout', osm_tag: 'leisure', osm_value: 'fitness_station', label: 'Street Workout' },
];

// Types pour les données Overpass
interface OverpassNode {
  type: 'node';
  id: number;
  lat: number;
  lon: number;
  tags?: {
    name?: string;
    'sport'?: string;
    'addr:full'?: string;
    'addr:street'?: string;
    'addr:housenumber'?: string;
    [key: string]: string | undefined;
  };
}

interface OverpassWay {
  type: 'way';
  id: number;
  nodes?: number[];
  center?: {
    lat: number;
    lon: number;
  };
  tags?: {
    name?: string;
    'sport'?: string;
    'addr:full'?: string;
    'addr:street'?: string;
    'addr:housenumber'?: string;
    [key: string]: string | undefined;
  };
}

interface OverpassResponse {
  elements: (OverpassNode | OverpassWay)[];
}

// Calculer la bounding box depuis un point central et un rayon
function calculateBoundingBox(lat: number, lng: number, radiusKm: number): {
  south: number;
  west: number;
  north: number;
  east: number;
} {
  // Approximation: 1 degré de latitude ≈ 111 km
  const latDelta = radiusKm / 111;
  // Pour la longitude, on ajuste selon la latitude
  const lngDelta = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));

  return {
    south: lat - latDelta,
    west: lng - lngDelta,
    north: lat + latDelta,
    east: lng + lngDelta,
  };
}

// Construire la requête Overpass QL dynamiquement pour tous les sports
function buildOverpassQuery(bbox: {
  south: number;
  west: number;
  north: number;
  east: number;
}): string {
  // Générer les requêtes pour chaque sport (node + way)
  const queries = TARGET_SPORTS.flatMap(sport => [
    `node["${sport.osm_tag}"="${sport.osm_value}"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});`,
    `way["${sport.osm_tag}"="${sport.osm_value}"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});`,
  ]);

  return `
    [out:json][timeout:60];
    (
      ${queries.join('\n      ')}
    );
    out center meta;
  `;
}

// Extraire les coordonnées d'un élément Overpass
function extractCoordinates(element: OverpassNode | OverpassWay): {
  lat: number;
  lon: number;
} | null {
  if (element.type === 'node') {
    return { lat: element.lat, lon: element.lon };
  } else if (element.type === 'way') {
    // Pour les ways, utiliser le centre si disponible
    if (element.center) {
      return { lat: element.center.lat, lon: element.center.lon };
    }
    // Sinon, on ne peut pas extraire les coordonnées sans les nodes complets
    return null;
  }
  return null;
}

// Détecter le type de sport d'un élément Overpass
function detectSportType(element: OverpassNode | OverpassWay): SportConfig | null {
  const tags = element.tags || {};
  for (const sport of TARGET_SPORTS) {
    if (tags[sport.osm_tag] === sport.osm_value) {
      return sport;
    }
  }
  return null;
}

// Extraire le nom d'un élément Overpass avec détection intérieur/extérieur
function extractName(element: OverpassNode | OverpassWay, sportLabel: string): string {
  const tags = element.tags || {};
  const baseName = tags.name?.trim() || `${sportLabel} sans nom`;
  
  // Ajouter "(Intérieur)" si indoor=yes ou building=yes
  const isIndoor = tags.indoor === 'yes' || tags.building === 'yes';
  return isIndoor ? `${baseName} (Intérieur)` : baseName;
}

// Extraire l'adresse d'un élément Overpass
function extractAddress(element: OverpassNode | OverpassWay): string | null {
  const tags = element.tags || {};
  
  if (tags['addr:full']) {
    return tags['addr:full'];
  }
  
  const street = tags['addr:street'];
  const housenumber = tags['addr:housenumber'];
  
  if (street) {
    return housenumber ? `${housenumber} ${street}` : street;
  }
  
  return null;
}

// Interroger l'API Overpass
async function fetchOverpassData(
  lat: number,
  lng: number,
  radiusKm: number
): Promise<OverpassResponse> {
  const bbox = calculateBoundingBox(lat, lng, radiusKm);
  const query = buildOverpassQuery(bbox);

  console.log(`🔍 Recherche dans la zone: ${bbox.south},${bbox.west} à ${bbox.north},${bbox.east}`);
  console.log(`📡 Envoi de la requête à Overpass API...`);

  const response = await fetch(OVERPASS_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `data=${encodeURIComponent(query)}`,
  });

  if (!response.ok) {
    throw new Error(`Erreur Overpass API: ${response.status} ${response.statusText}`);
  }

  const data: OverpassResponse = await response.json();
  return data;
}

// Vérifier si un terrain existe déjà (par coordonnées proches)
async function locationExists(
  supabase: ReturnType<typeof createClient>,
  lat: number,
  lon: number,
  toleranceMeters: number = 50
): Promise<boolean> {
  try {
    // Utiliser ST_DWithin pour vérifier si un point existe dans un rayon donné
    const { data, error } = await supabase.rpc('check_location_exists', {
      p_lat: lat,
      p_lon: lon,
      p_tolerance: toleranceMeters,
    });

    if (error) {
      // Si la fonction n'existe pas, on retourne false (on essaiera quand même d'insérer)
      if (error.message.includes('function') || error.message.includes('does not exist')) {
        console.warn('⚠️  Fonction check_location_exists non trouvée. Exécutez la migration 006_seed_functions.sql');
        return false;
      }
      // Autre erreur, on considère qu'il n'existe pas
      return false;
    }

    return (data as boolean) || false;
  } catch (err) {
    // En cas d'erreur, on considère qu'il n'existe pas et on essaiera d'insérer
    return false;
  }
}

// Résultat d'insertion
type InsertResult = {
  success: boolean;
  isDuplicate: boolean;
};

// Insérer un lieu dans Supabase
async function insertLocation(
  supabase: ReturnType<typeof createClient>,
  name: string,
  type: string,
  lat: number,
  lon: number,
  address: string | null
): Promise<InsertResult> {
  try {
    // Utiliser la fonction RPC pour insérer avec PostGIS
    const { data, error } = await supabase.rpc('insert_location_with_coords', {
      p_name: name,
      p_type: type,
      p_lat: lat,
      p_lon: lon,
      p_address: address,
    });

    if (error) {
      // Si la fonction n'existe pas, donner des instructions
      if (error.message.includes('function') || error.message.includes('does not exist')) {
        console.error(`❌ Fonction SQL manquante pour "${name}"`);
        console.error(`💡 Exécutez la migration 006_seed_functions.sql dans Supabase pour créer les fonctions helper`);
        return { success: false, isDuplicate: false };
      }
      console.error(`❌ Erreur insertion "${name}":`, error.message);
      return { success: false, isDuplicate: false };
    }

    // Si data est null, c'est un doublon (ON CONFLICT DO NOTHING retourne NULL)
    // Si data contient un UUID, c'est une insertion réussie
    if (data === null) {
      return { success: true, isDuplicate: true };
    }

    return { success: true, isDuplicate: false };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error(`❌ Erreur lors de l'insertion de "${name}":`, errorMessage);
    return { success: false, isDuplicate: false };
  }
}

// Fonction principale
async function main() {
  console.log('🚀 Démarrage du script de seed multi-sports\n');
  console.log(`🎯 Sports recherchés: ${TARGET_SPORTS.map(s => s.label).join(', ')}\n`);

  // Vérifier les variables d'environnement
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Variables d\'environnement manquantes!');
    console.error('Assurez-vous d\'avoir NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY dans .env.local');
    process.exit(1);
  }

  // Initialiser le client Supabase
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Récupérer les paramètres depuis les variables d'environnement ou utiliser les valeurs par défaut
  const lat = parseFloat(process.env.SEED_LAT || String(DEFAULT_LAT));
  const lng = parseFloat(process.env.SEED_LNG || String(DEFAULT_LNG));
  const radiusKm = parseFloat(process.env.SEED_RADIUS_KM || String(DEFAULT_RADIUS_KM));

  console.log(`📍 Zone de recherche:`);
  console.log(`   Centre: ${lat}, ${lng}`);
  console.log(`   Rayon: ${radiusKm} km\n`);

  try {
    // Récupérer les données depuis Overpass
    const overpassData = await fetchOverpassData(lat, lng, radiusKm);
    
    console.log(`✅ ${overpassData.elements.length} lieux sportifs trouvés dans OpenStreetMap\n`);

    if (overpassData.elements.length === 0) {
      console.log('ℹ️  Aucun lieu trouvé. Vérifiez la zone de recherche.');
      return;
    }

    // Traiter chaque élément
    let inserted = 0;
    let skipped = 0;
    let errors = 0;

    for (const element of overpassData.elements) {
      // Détecter le type de sport
      const sport = detectSportType(element);
      if (!sport) {
        console.warn(`⚠️  Type de sport non reconnu pour l'élément ${element.id}`);
        errors++;
        continue;
      }

      const coords = extractCoordinates(element);
      
      if (!coords) {
        console.warn(`⚠️  Impossible d'extraire les coordonnées pour l'élément ${element.id}`);
        errors++;
        continue;
      }

      const name = extractName(element, sport.label);
      const address = extractAddress(element);

      // Vérifier si le lieu existe déjà (vérification spatiale PostGIS)
      const exists = await locationExists(supabase, coords.lat, coords.lon);

      if (exists) {
        console.log(`⏭️  Doublon ignoré: "${name}" [${sport.label}]`);
        skipped++;
        continue;
      }

      // Insérer le lieu avec son type
      const result = await insertLocation(
        supabase,
        name,
        sport.id,
        coords.lat,
        coords.lon,
        address
      );

      if (result.success) {
        if (result.isDuplicate) {
          console.log(`⏭️  Doublon ignoré: "${name}" [${sport.label}]`);
          skipped++;
        } else {
          console.log(`✅ Inséré: "${name}" [${sport.label}] (${coords.lat.toFixed(6)}, ${coords.lon.toFixed(6)})`);
          inserted++;
        }
      } else {
        errors++;
      }

      // Petite pause pour éviter de surcharger l'API
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('\n📊 Résumé:');
    console.log(`   ✅ Insérés: ${inserted}`);
    console.log(`   ⏭️  Ignorés (doublons): ${skipped}`);
    console.log(`   ❌ Erreurs: ${errors}`);
    console.log(`   📍 Total trouvés: ${overpassData.elements.length}`);

  } catch (error) {
    console.error('\n❌ Erreur lors de l\'exécution:', error);
    if (error instanceof Error) {
      console.error('Message:', error.message);
    }
    process.exit(1);
  }
}

// Exécuter le script
main().catch(error => {
  console.error('Erreur fatale:', error);
  process.exit(1);
});

