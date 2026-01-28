import { createClient } from '@/lib/supabase/client';
import { Location } from '@/lib/types';

export interface LocationWithPopularity extends Location {
  checkins_count: number;
  active_count: number;
}

// Données de démo pour la carte (lieux sportifs à Paris)
const DEMO_LOCATIONS: LocationWithPopularity[] = [
  {
    id: '1',
    name: 'Urban Soccer Paris',
    type: 'five-a-side',
    coordinates: { lat: 48.8566, lng: 2.3522 },
    address: '15 Rue de Rivoli, 75001 Paris',
    image_url: null,
    checkins_count: 45,
    active_count: 8,
  },
  {
    id: '2',
    name: 'Gymnase Jean Jaurès',
    type: 'basketball',
    coordinates: { lat: 48.8606, lng: 2.3376 },
    address: '25 Avenue Jean Jaurès, 75019 Paris',
    image_url: null,
    checkins_count: 32,
    active_count: 5,
  },
  {
    id: '3',
    name: 'Tennis Club de Paris',
    type: 'tennis',
    coordinates: { lat: 48.8496, lng: 2.3470 },
    address: '8 Boulevard Saint-Michel, 75006 Paris',
    image_url: null,
    checkins_count: 28,
    active_count: 4,
  },
  {
    id: '4',
    name: 'Basic-Fit Châtelet',
    type: 'gym',
    coordinates: { lat: 48.8584, lng: 2.3488 },
    address: '42 Rue des Halles, 75001 Paris',
    image_url: null,
    checkins_count: 67,
    active_count: 12,
  },
  {
    id: '5',
    name: 'Stade Charléty - Piste',
    type: 'running',
    coordinates: { lat: 48.8186, lng: 2.3476 },
    address: '99 Boulevard Kellermann, 75013 Paris',
    image_url: null,
    checkins_count: 54,
    active_count: 15,
  },
  {
    id: '6',
    name: 'Le Five Paris 12',
    type: 'futsal',
    coordinates: { lat: 48.8412, lng: 2.3890 },
    address: '88 Avenue Daumesnil, 75012 Paris',
    image_url: null,
    checkins_count: 89,
    active_count: 10,
  },
  {
    id: '7',
    name: 'Parc des Princes - Foot',
    type: 'soccer',
    coordinates: { lat: 48.8414, lng: 2.2530 },
    address: '24 Rue du Commandant Guilbaud, 75016 Paris',
    image_url: null,
    checkins_count: 156,
    active_count: 22,
  },
  {
    id: '8',
    name: 'Fitness Park Nation',
    type: 'gym',
    coordinates: { lat: 48.8489, lng: 2.3956 },
    address: '5 Place de la Nation, 75011 Paris',
    image_url: null,
    checkins_count: 78,
    active_count: 18,
  },
];

export const locationsService = {
  async getLocations(): Promise<Location[]> {
    const supabase = createClient();
    
    try {
      // Essayer de récupérer depuis Supabase
      const { data, error } = await supabase
        .from('locations')
        .select('*');
      
      if (error) {
        console.warn('Supabase locations error, using demo data:', error.message);
        return DEMO_LOCATIONS;
      }

      if (!data || data.length === 0) {
        console.log('No locations in database, using demo data');
        return DEMO_LOCATIONS;
      }

      // Transformer les données si elles existent
      return data.map((location: any) => ({
        id: location.id,
        name: location.name,
        type: location.type || 'default',
        coordinates: {
          lat: location.lat || location.latitude || 48.8566,
          lng: location.lng || location.longitude || 2.3522,
        },
        address: location.address,
        image_url: location.image_url,
      }));
    } catch (err) {
      console.warn('Error fetching locations, using demo data:', err);
      return DEMO_LOCATIONS;
    }
  },

  async getLocation(locationId: string): Promise<Location | null> {
    const locations = await this.getLocations();
    return locations.find(loc => loc.id === locationId) || null;
  },

  // Récupère tous les lieux avec leur popularité (nombre de check-ins)
  async getLocationsWithPopularity(): Promise<LocationWithPopularity[]> {
    const supabase = createClient();
    
    try {
      // Essayer de récupérer depuis Supabase
      const { data, error } = await supabase
        .from('locations')
        .select('*');
      
      if (error) {
        console.warn('Supabase error, using demo data:', error.message);
        return DEMO_LOCATIONS;
      }

      if (!data || data.length === 0) {
        console.log('No locations in database, using demo data');
        return DEMO_LOCATIONS;
      }

      // Transformer les données avec des compteurs par défaut
      return data.map((location: any) => ({
        id: location.id,
        name: location.name,
        type: location.type || 'default',
        coordinates: {
          lat: location.lat || location.latitude || 48.8566,
          lng: location.lng || location.longitude || 2.3522,
        },
        address: location.address,
        image_url: location.image_url,
        checkins_count: location.checkins_count || Math.floor(Math.random() * 50),
        active_count: location.active_count || Math.floor(Math.random() * 10),
      }));
    } catch (err) {
      console.warn('Error fetching locations with popularity, using demo data:', err);
      return DEMO_LOCATIONS;
    }
  },
};
