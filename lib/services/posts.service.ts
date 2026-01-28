import { createClient } from '@/lib/supabase/client';

export const postsService = {
  async getPosts(limit: number = 20, offset: number = 0) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles!posts_user_id_fkey (
          id,
          username,
          avatar_url
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }
    
    return data || [];
  },

  async getPost(postId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        profiles!posts_user_id_fkey (
          id,
          username,
          avatar_url
        )
      `)
      .eq('id', postId)
      .single();
    if (error) throw error;
    return data;
  },

  async createPost(userId: string, postData: {
    media_type: 'image' | 'video';
    media_url: string;
    sport_type: string;
    description: string;
  }) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('posts')
      .insert({
        user_id: userId,
        ...postData,
      })
      .select(`
        *,
        profiles!posts_user_id_fkey (
          id,
          username,
          avatar_url
        )
      `)
      .single();
    if (error) throw error;
    return data;
  },

  async updatePost(postId: string, userId: string, updates: {
    description?: string;
    sport_type?: string;
  }) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('posts')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', postId)
      .eq('user_id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deletePost(postId: string, userId: string) {
    const supabase = createClient();
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId)
      .eq('user_id', userId);
    if (error) throw error;
  },

  async likePost(postId: string, userId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('post_likes')
      .insert({
        post_id: postId,
        user_id: userId,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async unlikePost(postId: string, userId: string) {
    const supabase = createClient();
    const { error } = await supabase
      .from('post_likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId);
    if (error) throw error;
  },

  async isLiked(postId: string, userId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();
    return !!data && !error;
  },

  async getComments(postId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('post_comments')
      .select(`
        *,
        profiles!post_comments_user_id_fkey (
          id,
          username,
          avatar_url
        )
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data;
  },

  async addComment(postId: string, userId: string, text: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('post_comments')
      .insert({
        post_id: postId,
        user_id: userId,
        text,
      })
      .select(`
        *,
        profiles!post_comments_user_id_fkey (
          id,
          username,
          avatar_url
        )
      `)
      .single();
    if (error) throw error;
    return data;
  },

  async deleteComment(commentId: string, userId: string) {
    const supabase = createClient();
    const { error } = await supabase
      .from('post_comments')
      .delete()
      .eq('id', commentId)
      .eq('user_id', userId);
    if (error) throw error;
  },

  async savePost(postId: string, userId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('saved_posts')
      .insert({
        post_id: postId,
        user_id: userId,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async unsavePost(postId: string, userId: string) {
    const supabase = createClient();
    const { error } = await supabase
      .from('saved_posts')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId);
    if (error) throw error;
  },

  async isSaved(postId: string, userId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('saved_posts')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();
    return !!data && !error;
  },

  async uploadMedia(userId: string, file: File, type: 'image' | 'video') {
    const supabase = createClient();
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('posts')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });
    
    if (uploadError) throw uploadError;
    
    const { data: { publicUrl } } = supabase.storage
      .from('posts')
      .getPublicUrl(fileName);
    
    return publicUrl;
  },
};

