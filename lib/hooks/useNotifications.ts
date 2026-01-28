import { useQuery, useMutation, useQueryClient, useQueryClient as useQueryClientHook } from '@tanstack/react-query';
import { notificationsService } from '@/lib/services/notifications.service';
import { useAuth } from '@/app/components/AuthProvider';
import { useEffect } from 'react';
import { transformNotifications } from '@/lib/utils/transform';
import { Notification } from '@/lib/types';

export const useNotifications = (limit: number = 20, offset: number = 0) => {
  const { user } = useAuth();

  return useQuery<Notification[]>({
    queryKey: ['notifications', user?.id, limit, offset],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      const data = await notificationsService.getNotifications(user.id, limit, offset);
      return transformNotifications(data || []);
    },
    enabled: !!user,
  });
};

export const useUnreadCount = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['notifications', 'unread', user?.id],
    queryFn: () => {
      if (!user) throw new Error('User not authenticated');
      return notificationsService.getUnreadCount(user.id);
    },
    enabled: !!user,
    refetchInterval: 30000, // Rafraîchir toutes les 30 secondes
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (notificationId: string) => {
      if (!user) throw new Error('User not authenticated');
      return notificationsService.markAsRead(notificationId, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread', user?.id] });
    },
  });
};

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: () => {
      if (!user) throw new Error('User not authenticated');
      return notificationsService.markAllAsRead(user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread', user?.id] });
    },
  });
};

export const useNotificationsRealtime = () => {
  const { user } = useAuth();
  const queryClient = useQueryClientHook();

  useEffect(() => {
    if (!user) return;

    const unsubscribe = notificationsService.subscribeToNotifications(user.id, (payload) => {
      // Invalider les queries pour rafraîchir les notifications
      queryClient.invalidateQueries({ queryKey: ['notifications', user.id] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread', user.id] });
    });

    return () => {
      unsubscribe();
    };
  }, [user, queryClient]);
};

