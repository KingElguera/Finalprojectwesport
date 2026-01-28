import { createClient } from '@/lib/supabase/client';

export const profileService = {
  async getProfile(userId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data;
  },

  async updateProfile(userId: string, updates: {
    username?: string;
    bio?: string;
    avatar_url?: string;
  }) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async checkUsernameAvailable(username: string, excludeUserId?: string) {
    const supabase = createClient();
    let query = supabase
      .from('profiles')
      .select('id')
      .eq('username', username);
    
    if (excludeUserId) {
      query = query.neq('id', excludeUserId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).length === 0;
  },

  canChangeUsername(history: number[]): boolean {
    const USERNAME_CHANGE_LIMIT = 2;
    const USERNAME_CHANGE_WINDOW_MS = 3 * 30 * 24 * 60 * 60 * 1000; // 3 mois
    
    if (history.length < USERNAME_CHANGE_LIMIT) {
      return true;
    }
    
    const threeMonthsAgo = Date.now() - USERNAME_CHANGE_WINDOW_MS;
    const recentChanges = history.filter(timestamp => timestamp >= threeMonthsAgo);
    
    return recentChanges.length < USERNAME_CHANGE_LIMIT;
  },

  getNextUsernameChangeDate(history: number[]): Date | null {
    const USERNAME_CHANGE_LIMIT = 2;
    const USERNAME_CHANGE_WINDOW_MS = 3 * 30 * 24 * 60 * 60 * 1000;
    
    if (this.canChangeUsername(history)) {
      return null;
    }
    
    if (history.length === 0) {
      return null;
    }
    
    const sortedHistory = [...history].sort((a, b) => b - a);
    const recentChanges = sortedHistory.slice(0, USERNAME_CHANGE_LIMIT);
    const oldestRecentChange = recentChanges[recentChanges.length - 1];
    const nextChangeDate = oldestRecentChange + USERNAME_CHANGE_WINDOW_MS;
    
    return new Date(nextChangeDate);
  },

  async updateUsername(userId: string, newUsername: string) {
    const supabase = createClient();
    const profile = await this.getProfile(userId);
    const history = (profile.username_change_history as number[]) || [];
    
    // Vérifier si le changement est autorisé
    if (!this.canChangeUsername(history)) {
      throw new Error('Limite de changements de pseudo atteinte');
    }
    
    // Vérifier l'unicité du username
    const isAvailable = await this.checkUsernameAvailable(newUsername, userId);
    if (!isAvailable) {
      throw new Error('Ce pseudo est déjà utilisé');
    }
    
    // Ajouter le timestamp actuel à l'historique
    history.push(Date.now());
    
    const { data, error } = await supabase
      .from('profiles')
      .update({
        username: newUsername,
        username_change_history: history,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateBio(userId: string, bio: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('profiles')
      .update({
        bio,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async uploadAvatar(userId: string, file: File) {
    const supabase = createClient();
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });
    
    if (uploadError) throw uploadError;
    
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);
    
    // Mettre à jour le profil avec la nouvelle URL
    return await this.updateProfile(userId, { avatar_url: publicUrl });
  },

  async getFollowers(userId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('follows')
      .select(`
        follower_id,
        profiles!follows_follower_id_fkey (
          id,
          username,
          avatar_url,
          bio
        )
      `)
      .eq('following_id', userId);
    if (error) throw error;
    return data;
  },

  async getFollowing(userId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('follows')
      .select(`
        following_id,
        profiles!follows_following_id_fkey (
          id,
          username,
          avatar_url,
          bio
        )
      `)
      .eq('follower_id', userId);
    if (error) throw error;
    return data;
  },

  async followUser(followerId: string, followingId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('follows')
      .insert({
        follower_id: followerId,
        following_id: followingId,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async unfollowUser(followerId: string, followingId: string) {
    const supabase = createClient();
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId);
    if (error) throw error;
  },
};

