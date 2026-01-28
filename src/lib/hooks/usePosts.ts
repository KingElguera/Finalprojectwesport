import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { postsService } from '@/lib/services/posts.service';
import { useAuth } from '@/components/AuthProvider';
import { transformPosts, transformPost } from '@/lib/utils/transform';

export const usePosts = (limit: number = 20, offset: number = 0) => {
  return useQuery({
    queryKey: ['posts', limit, offset],
    queryFn: async () => {
      const data = await postsService.getPosts(limit, offset);
      return transformPosts(data || []);
    },
  });
};

export const useInfinitePosts = (limit: number = 20) => {
  return useInfiniteQuery({
    queryKey: ['posts', 'infinite'],
    queryFn: async ({ pageParam = 0 }) => {
      const data = await postsService.getPosts(limit, pageParam);
      return transformPosts(data || []);
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < limit) return undefined;
      return allPages.length * limit;
    },
    initialPageParam: 0,
  });
};

export const useUserPosts = (userId: string, limit: number = 20, offset: number = 0) => {
  return useQuery({
    queryKey: ['posts', 'user', userId, limit, offset],
    queryFn: async () => {
      const supabase = (await import('@/lib/supabase/client')).createClient();
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
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);
        if (error) return [];
        return transformPosts(data || []);
      } catch {
        return [];
      }
    },
    enabled: !!userId,
  });
};

export const usePost = (postId: string) => {
  return useQuery({
    queryKey: ['post', postId],
    queryFn: async () => {
      const data = await postsService.getPost(postId);
      return transformPost(data);
    },
    enabled: !!postId,
  });
};

export const useIsLiked = (postId: string) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['post', postId, 'liked', user?.id],
    queryFn: () => {
      if (!user) return false;
      return postsService.isLiked(postId, user.id);
    },
    enabled: !!postId && !!user,
  });
};

export const useIsSaved = (postId: string) => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['post', postId, 'saved', user?.id],
    queryFn: () => {
      if (!user) return false;
      return postsService.isSaved(postId, user.id);
    },
    enabled: !!postId && !!user,
  });
};

export const useSavePost = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (postId: string) => {
      if (!user) throw new Error('User not authenticated');
      return postsService.savePost(postId, user.id);
    },
    onSuccess: (_, postId) => {
      queryClient.invalidateQueries({ queryKey: ['post', postId, 'saved'] });
    },
  });
};

export const useUnsavePost = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (postId: string) => {
      if (!user) throw new Error('User not authenticated');
      return postsService.unsavePost(postId, user.id);
    },
    onSuccess: (_, postId) => {
      queryClient.invalidateQueries({ queryKey: ['post', postId, 'saved'] });
    },
  });
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (postData: {
      media_type: 'image' | 'video';
      media_url: string;
      sport_type: string;
      description: string;
    }) => {
      if (!user) throw new Error('User not authenticated');
      return postsService.createPost(user.id, postData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};

export const useLikePost = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (postId: string) => {
      if (!user) throw new Error('User not authenticated');
      return postsService.likePost(postId, user.id);
    },
    onSuccess: (_, postId) => {
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};

export const useUnlikePost = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (postId: string) => {
      if (!user) throw new Error('User not authenticated');
      return postsService.unlikePost(postId, user.id);
    },
    onSuccess: (_, postId) => {
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};

export const useComments = (postId: string) => {
  return useQuery({
    queryKey: ['comments', postId],
    queryFn: async () => {
      const data = await postsService.getComments(postId);
      const { transformComments } = await import('@/lib/utils/transform');
      return transformComments(data || []);
    },
    enabled: !!postId,
  });
};

export const useAddComment = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({ postId, text }: { postId: string; text: string }) => {
      if (!user) throw new Error('User not authenticated');
      return postsService.addComment(postId, user.id, text);
    },
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
    },
  });
};
