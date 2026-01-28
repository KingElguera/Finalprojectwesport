import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileService } from '@/lib/services/profile.service';
import { useAuth } from '@/components/AuthProvider';
import { transformFollowers, transformFollowingList } from '@/lib/utils/transform';
import { User } from '@/lib/types';

export const useProfile = (userId?: string) => {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;

  return useQuery({
    queryKey: ['profile', targetUserId],
    queryFn: () => {
      if (!targetUserId) throw new Error('User ID required');
      return profileService.getProfile(targetUserId);
    },
    enabled: !!targetUserId,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (updates: {
      username?: string;
      bio?: string;
      avatar_url?: string;
    }) => {
      if (!user) throw new Error('User not authenticated');
      return profileService.updateProfile(user.id, updates);
    },
    onSuccess: (_, __, context) => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
    },
  });
};

export const useFollowers = (userId: string) => {
  return useQuery<User[]>({
    queryKey: ['followers', userId],
    queryFn: async () => {
      const data = await profileService.getFollowers(userId);
      return transformFollowers(data || []);
    },
    enabled: !!userId,
  });
};

export const useFollowing = (userId: string) => {
  return useQuery<User[]>({
    queryKey: ['following', userId],
    queryFn: async () => {
      const data = await profileService.getFollowing(userId);
      return transformFollowingList(data || []);
    },
    enabled: !!userId,
  });
};

export const useFollowUser = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (followingId: string) => {
      if (!user) throw new Error('User not authenticated');
      return profileService.followUser(user.id, followingId);
    },
    onSuccess: (_, followingId) => {
      queryClient.invalidateQueries({ queryKey: ['followers', followingId] });
      queryClient.invalidateQueries({ queryKey: ['following', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['profile', followingId] });
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
    },
  });
};

export const useUnfollowUser = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (followingId: string) => {
      if (!user) throw new Error('User not authenticated');
      return profileService.unfollowUser(user.id, followingId);
    },
    onSuccess: (_, followingId) => {
      queryClient.invalidateQueries({ queryKey: ['followers', followingId] });
      queryClient.invalidateQueries({ queryKey: ['following', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['profile', followingId] });
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
    },
  });
};

