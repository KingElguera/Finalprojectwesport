import { createClient } from '@/lib/supabase/client';

export interface LocationRatingStats {
  average_rating: number | null;
  ratings_count: number;
}

export interface LocationRating {
  id: string;
  user_id: string;
  location_id: string;
  rating: number;
  created_at: string;
  updated_at: string;
}

export const ratingsService = {
  /**
   * Ajouter ou mettre à jour la note d'un utilisateur pour un lieu
   */
  async rateLocation(userId: string, locationId: string, rating: number): Promise<LocationRating> {
    const supabase = createClient();
    
    // Utiliser upsert pour créer ou mettre à jour la note
    const { data, error } = await supabase
      .from('location_ratings')
      .upsert(
        {
          user_id: userId,
          location_id: locationId,
          rating,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,location_id',
        }
      )
      .select()
      .single();

    if (error) {
      console.error('Error rating location:', error);
      throw error;
    }

    return data;
  },

  /**
   * Récupérer la note d'un utilisateur pour un lieu spécifique
   */
  async getUserRating(userId: string, locationId: string): Promise<number | null> {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('location_ratings')
      .select('rating')
      .eq('user_id', userId)
      .eq('location_id', locationId)
      .single();

    if (error) {
      // Pas d'erreur si aucune note trouvée
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching user rating:', error);
      throw error;
    }

    return data?.rating || null;
  },

  /**
   * Récupérer les statistiques de notation d'un lieu (moyenne et nombre de notes)
   */
  async getLocationRatingStats(locationId: string): Promise<LocationRatingStats> {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .rpc('get_location_rating_stats', { p_location_id: locationId });

    if (error) {
      console.error('Error fetching location rating stats:', error);
      // Retourner des valeurs par défaut en cas d'erreur
      return {
        average_rating: null,
        ratings_count: 0,
      };
    }

    // La fonction retourne un tableau avec une seule ligne
    const stats = data?.[0] || { average_rating: null, ratings_count: 0 };
    
    return {
      average_rating: stats.average_rating ? parseFloat(stats.average_rating) : null,
      ratings_count: parseInt(stats.ratings_count) || 0,
    };
  },

  /**
   * Supprimer la note d'un utilisateur pour un lieu
   */
  async removeRating(userId: string, locationId: string): Promise<void> {
    const supabase = createClient();
    
    const { error } = await supabase
      .from('location_ratings')
      .delete()
      .eq('user_id', userId)
      .eq('location_id', locationId);

    if (error) {
      console.error('Error removing rating:', error);
      throw error;
    }
  },
};

