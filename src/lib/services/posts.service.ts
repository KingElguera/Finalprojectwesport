import { createClient } from '@/lib/supabase/client';

// Données de démo pour les posts
const DEMO_POSTS = [
  {
    id: '1',
    user_id: 'demo-user-1',
    media_type: 'image',
    media_url: 'https://images.unsplash.com/photo-1461896836934- voices-of-2023-b93e71f2-7b0f-4e9a-9d23-0a6b6b8bfc6e?w=800',
    sport_type: 'football',
    description: 'Super entraînement ce matin ! ⚽🔥 On prépare le match de dimanche',
    likes_count: 45,
    comments_count: 12,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    profiles: {
      id: 'demo-user-1',
      username: 'alex_foot',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
    },
  },
  {
    id: '2',
    user_id: 'demo-user-2',
    media_type: 'image',
    media_url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800',
    sport_type: 'basketball',
    description: 'Nouveau record personnel ! 🏀💪 3 points à la suite',
    likes_count: 89,
    comments_count: 23,
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    profiles: {
      id: 'demo-user-2',
      username: 'marie_basket',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marie',
    },
  },
  {
    id: '3',
    user_id: 'demo-user-3',
    media_type: 'image',
    media_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800',
    sport_type: 'fitness',
    description: 'Leg day done! 💪 Never skip leg day mes amis',
    likes_count: 156,
    comments_count: 34,
    created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    profiles: {
      id: 'demo-user-3',
      username: 'coach_thomas',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=thomas',
    },
  },
  {
    id: '4',
    user_id: 'demo-user-4',
    media_type: 'image',
    media_url: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800',
    sport_type: 'running',
    description: 'Semi-marathon de Paris terminé en 1h45 ! 🏃‍♀️🎉 Trop fière',
    likes_count: 234,
    comments_count: 56,
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    profiles: {
      id: 'demo-user-4',
      username: 'sarah_run',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
    },
  },
  {
    id: '5',
    user_id: 'demo-user-5',
    media_type: 'image',
    media_url: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800',
    sport_type: 'tennis',
    description: 'Premier match gagné en tournoi ! 🎾🏆 Let\'s go',
    likes_count: 78,
    comments_count: 18,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    profiles: {
      id: 'demo-user-5',
      username: 'lucas_tennis',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lucas',
    },
  },
  {
    id: '6',
    user_id: 'demo-user-6',
    media_type: 'image',
    media_url: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800',
    sport_type: 'swimming',
    description: 'Morning swim 🏊‍♂️ Rien de mieux pour commencer la journée',
    likes_count: 92,
    comments_count: 15,
    created_at: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    profiles: {
      id: 'demo-user-6',
      username: 'emma_swim',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma',
    },
  },
];

export const postsService = {
  async getPosts(limit: number = 20, offset: number = 0) {
    const supabase = createClient();
    
    try {
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
        console.log('Using demo posts (Supabase table not available)');
        return DEMO_POSTS.slice(offset, offset + limit);
      }
      
      if (!data || data.length === 0) {
        console.log('No posts in database, using demo posts');
        return DEMO_POSTS.slice(offset, offset + limit);
      }
      
      return data;
    } catch (err) {
      console.log('Using demo posts');
      return DEMO_POSTS.slice(offset, offset + limit);
    }
  },

  async getPost(postId: string) {
    // Chercher dans les posts de démo d'abord
    const demoPost = DEMO_POSTS.find(p => p.id === postId);
    if (demoPost) return demoPost;
    
    const supabase = createClient();
    try {
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
      if (error) return demoPost || DEMO_POSTS[0];
      return data;
    } catch {
      return demoPost || DEMO_POSTS[0];
    }
  },

  async createPost(userId: string, postData: {
    media_type: 'image' | 'video';
    media_url: string;
    sport_type: string;
    description: string;
  }) {
    const supabase = createClient();
    try {
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
    } catch {
      // Retourner un post simulé
      return {
        id: `demo-${Date.now()}`,
        user_id: userId,
        ...postData,
        likes_count: 0,
        comments_count: 0,
        created_at: new Date().toISOString(),
        profiles: {
          id: userId,
          username: 'vous',
          avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=you',
        },
      };
    }
  },

  async updatePost(postId: string, userId: string, updates: {
    description?: string;
    sport_type?: string;
  }) {
    const supabase = createClient();
    try {
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
    } catch {
      return null;
    }
  },

  async deletePost(postId: string, userId: string) {
    const supabase = createClient();
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', userId);
      if (error) throw error;
    } catch {
      // Silently fail for demo
    }
  },

  async likePost(postId: string, userId: string) {
    const supabase = createClient();
    try {
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
    } catch {
      return { post_id: postId, user_id: userId };
    }
  },

  async unlikePost(postId: string, userId: string) {
    const supabase = createClient();
    try {
      const { error } = await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId);
      if (error) throw error;
    } catch {
      // Silently fail for demo
    }
  },

  async isLiked(postId: string, userId: string) {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from('post_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single();
      return !!data && !error;
    } catch {
      return false;
    }
  },

  async getComments(postId: string) {
    const supabase = createClient();
    try {
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
      if (error) return [];
      return data || [];
    } catch {
      return [];
    }
  },

  async addComment(postId: string, userId: string, text: string) {
    const supabase = createClient();
    try {
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
    } catch {
      return {
        id: `demo-comment-${Date.now()}`,
        post_id: postId,
        user_id: userId,
        text,
        created_at: new Date().toISOString(),
        profiles: {
          id: userId,
          username: 'vous',
          avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=you',
        },
      };
    }
  },

  async deleteComment(commentId: string, userId: string) {
    const supabase = createClient();
    try {
      const { error } = await supabase
        .from('post_comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', userId);
      if (error) throw error;
    } catch {
      // Silently fail for demo
    }
  },

  async savePost(postId: string, userId: string) {
    const supabase = createClient();
    try {
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
    } catch {
      return { post_id: postId, user_id: userId };
    }
  },

  async unsavePost(postId: string, userId: string) {
    const supabase = createClient();
    try {
      const { error } = await supabase
        .from('saved_posts')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId);
      if (error) throw error;
    } catch {
      // Silently fail for demo
    }
  },

  async isSaved(postId: string, userId: string) {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from('saved_posts')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single();
      return !!data && !error;
    } catch {
      return false;
    }
  },

  async uploadMedia(userId: string, file: File, type: 'image' | 'video') {
    const supabase = createClient();
    try {
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
    } catch {
      // Retourner une URL de placeholder
      return 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800';
    }
  },
};
