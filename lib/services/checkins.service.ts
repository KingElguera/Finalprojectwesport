import { createClient } from '@/lib/supabase/client';
import { Checkin } from '@/lib/types';

export interface CheckinWithUser extends Checkin {
  user: {
    id: string;
    username: string;
    avatar_url: string;
  };
}

export interface FriendAtLocation {
  id: string;
  username: string;
  avatar_url: string;
  checkin_time: string;
  message?: string;
}

export const checkinsService = {
  async createCheckin(
    userId: string,
    locationId: string,
    isPublic: boolean = true,
    message?: string,
    endTime?: string
  ): Promise<Checkin> {
    const supabase = createClient();
    
    // D'abord, terminer tous les check-ins actifs de cet utilisateur
    // (un utilisateur ne peut être qu'à un seul endroit à la fois)
    const { error: endError } = await supabase
      .from('checkins')
      .update({ end_time: new Date().toISOString() })
      .eq('user_id', userId)
      .is('end_time', null);

    if (endError) {
      console.error('Error ending previous checkins:', endError);
      // On continue quand même pour créer le nouveau check-in
    }

    // Ensuite, créer le nouveau check-in
    const { data, error } = await supabase
      .from('checkins')
      .insert({
        user_id: userId,
        location_id: locationId,
        is_public: isPublic,
        message: message || null,
        end_time: endTime || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating checkin:', error);
      throw error;
    }

    return data;
  },

  async getCheckinsByLocation(locationId: string): Promise<Checkin[]> {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('checkins')
      .select('*')
      .eq('location_id', locationId)
      .eq('is_public', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching checkins:', error);
      throw error;
    }

    return data || [];
  },

  async getUserCheckins(userId: string): Promise<Checkin[]> {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('checkins')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user checkins:', error);
      throw error;
    }

    return data || [];
  },

  async updateCheckin(
    checkinId: string,
    userId: string,
    updates: {
      is_public?: boolean;
      message?: string;
      end_time?: string;
    }
  ): Promise<Checkin> {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('checkins')
      .update(updates)
      .eq('id', checkinId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating checkin:', error);
      throw error;
    }

    return data;
  },

  async deleteCheckin(checkinId: string, userId: string): Promise<void> {
    const supabase = createClient();
    
    const { error } = await supabase
      .from('checkins')
      .delete()
      .eq('id', checkinId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error deleting checkin:', error);
      throw error;
    }
  },

  // Compte le nombre de check-ins actifs (personnes actuellement présentes)
  async getActiveCheckinsCount(locationId: string): Promise<number> {
    const supabase = createClient();
    
    const { count, error } = await supabase
      .from('checkins')
      .select('*', { count: 'exact', head: true })
      .eq('location_id', locationId)
      .eq('is_public', true)
      .is('end_time', null);

    if (error) {
      console.error('Error counting active checkins:', error);
      throw error;
    }

    return count || 0;
  },

  // Liste des utilisateurs actuellement présents à un lieu
  async getActiveCheckinsAtLocation(locationId: string): Promise<CheckinWithUser[]> {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('checkins')
      .select(`
        *,
        user:profiles!checkins_user_id_fkey (
          id,
          username,
          avatar_url
        )
      `)
      .eq('location_id', locationId)
      .eq('is_public', true)
      .is('end_time', null)
      .order('start_time', { ascending: false });

    if (error) {
      console.error('Error fetching active checkins:', error);
      throw error;
    }

    return (data || []) as CheckinWithUser[];
  },

  // Récupère les amis (personnes qu'on suit) actuellement présents à un lieu
  async getFriendsAtLocation(userId: string, locationId: string): Promise<FriendAtLocation[]> {
    const supabase = createClient();
    
    // D'abord récupérer la liste des personnes que l'utilisateur suit
    const { data: following, error: followError } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', userId);

    if (followError) {
      console.error('Error fetching following list:', followError);
      throw followError;
    }

    if (!following || following.length === 0) {
      return [];
    }

    const followingIds = following.map(f => f.following_id);

    // Ensuite récupérer les check-ins actifs de ces amis à ce lieu
    const { data, error } = await supabase
      .from('checkins')
      .select(`
        start_time,
        message,
        user:profiles!checkins_user_id_fkey (
          id,
          username,
          avatar_url
        )
      `)
      .eq('location_id', locationId)
      .eq('is_public', true)
      .is('end_time', null)
      .in('user_id', followingIds);

    if (error) {
      console.error('Error fetching friends at location:', error);
      throw error;
    }

    return (data || []).map((item: any) => ({
      id: item.user.id,
      username: item.user.username,
      avatar_url: item.user.avatar_url,
      checkin_time: item.start_time,
      message: item.message,
    }));
  },

  // Récupère les amis ayant visité un lieu récemment (dans les X derniers jours)
  async getFriendsRecentlyAtLocation(
    userId: string, 
    locationId: string, 
    days: number = 30
  ): Promise<FriendAtLocation[]> {
    const supabase = createClient();
    
    // D'abord récupérer la liste des personnes que l'utilisateur suit
    const { data: following, error: followError } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', userId);

    if (followError) {
      console.error('Error fetching following list:', followError);
      throw followError;
    }

    if (!following || following.length === 0) {
      return [];
    }

    const followingIds = following.map(f => f.following_id);
    
    // Calculer la date limite
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - days);

    // Récupérer les check-ins récents de ces amis à ce lieu (excluant ceux actuellement présents)
    const { data, error } = await supabase
      .from('checkins')
      .select(`
        start_time,
        message,
        user:profiles!checkins_user_id_fkey (
          id,
          username,
          avatar_url
        )
      `)
      .eq('location_id', locationId)
      .eq('is_public', true)
      .not('end_time', 'is', null)
      .gte('start_time', dateLimit.toISOString())
      .in('user_id', followingIds)
      .order('start_time', { ascending: false });

    if (error) {
      console.error('Error fetching friends recently at location:', error);
      throw error;
    }

    // Dédupliquer par utilisateur (garder le plus récent)
    const seenUsers = new Set<string>();
    const uniqueFriends: FriendAtLocation[] = [];
    
    for (const item of (data || []) as any[]) {
      if (!seenUsers.has(item.user.id)) {
        seenUsers.add(item.user.id);
        uniqueFriends.push({
          id: item.user.id,
          username: item.user.username,
          avatar_url: item.user.avatar_url,
          checkin_time: item.start_time,
          message: item.message,
        });
      }
    }

    return uniqueFriends;
  },

  // Compte le nombre total de check-ins pour un lieu (pour le tri par popularité)
  async getTotalCheckinsCount(locationId: string): Promise<number> {
    const supabase = createClient();
    
    const { count, error } = await supabase
      .from('checkins')
      .select('*', { count: 'exact', head: true })
      .eq('location_id', locationId);

    if (error) {
      console.error('Error counting total checkins:', error);
      throw error;
    }

    return count || 0;
  },
};

