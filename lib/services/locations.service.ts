import { createClient } from '@/lib/supabase/client';
import { Location } from '@/lib/types';

export interface LocationWithPopularity extends Location {
  checkins_count: number;
  active_count: number;
}

export const locationsService = {
  async getLocations(): Promise<Location[]> {
    const supabase = createClient();
    
    // Utiliser la fonction RPC qui extrait lat/lng avec ST_X/ST_Y
    const { data, error } = await supabase.rpc('get_locations_with_coords');
    
    if (error) {
      console.error('Error fetching locations:', error);
      throw error;
    }

    // Transformer les données avec lat/lng déjà extraits
    return (data || []).map((location: any) => ({
      id: location.id,
      name: location.name,
      type: location.type,
      coordinates: {
        lat: location.lat,
        lng: location.lng,
      },
      address: location.address,
      image_url: location.image_url,
      created_at: location.created_at,
      updated_at: location.updated_at,
    }));
  },

  async getLocation(locationId: string): Promise<Location | null> {
    const supabase = createClient();
    
    // Pour un seul lieu, on pourrait créer une fonction RPC similaire
    // Pour l'instant, on récupère tous les lieux et on filtre
    const locations = await this.getLocations();
    return locations.find(loc => loc.id === locationId) || null;
  },

  // Récupère tous les lieux avec leur popularité (nombre de check-ins)
  async getLocationsWithPopularity(): Promise<LocationWithPopularity[]> {
    const supabase = createClient();
    
    // Utiliser la fonction RPC qui récupère les lieux avec les compteurs de check-ins
    const { data, error } = await supabase.rpc('get_locations_with_popularity');
    
    if (error) {
      console.error('Error fetching locations with popularity:', error);
      // Fallback: récupérer les lieux sans popularité
      const locations = await this.getLocations();
      return locations.map(loc => ({
        ...loc,
        checkins_count: 0,
        active_count: 0,
      }));
    }

    // Transformer les données
    return (data || []).map((location: any) => ({
      id: location.id,
      name: location.name,
      type: location.type,
      coordinates: {
        lat: location.lat,
        lng: location.lng,
      },
      address: location.address,
      image_url: location.image_url,
      created_at: location.created_at,
      updated_at: location.updated_at,
      checkins_count: location.checkins_count || 0,
      active_count: location.active_count || 0,
    }));
  },
};
