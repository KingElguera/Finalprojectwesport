import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useCallback, useRef, useState } from 'react';
import { chatService } from '@/lib/services/chat.service';
import { useAuth } from '@/components/AuthProvider';
import type { 
  Conversation, 
  Message, 
  TypingIndicator,
  CreateConversationInput,
  SendMessageInput 
} from '@/lib/types';

// =============================================
// CONVERSATIONS HOOKS
// =============================================

/**
 * Hook pour récupérer toutes les conversations de l'utilisateur
 */
export const useConversations = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: () => {
      if (!user) return [];
      return chatService.getConversations(user.id);
    },
    enabled: !!user,
    refetchInterval: 30000, // Refetch toutes les 30 secondes
  });

  // S'abonner aux mises à jour en temps réel
  useEffect(() => {
    if (!user) return;

    const unsubscribe = chatService.subscribeToConversations(user.id, () => {
      queryClient.invalidateQueries({ queryKey: ['conversations', user.id] });
    });

    return unsubscribe;
  }, [user, queryClient]);

  return query;
};

/**
 * Hook pour récupérer une conversation spécifique
 */
export const useConversation = (conversationId: string | null) => {
  return useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: () => {
      if (!conversationId) return null;
      return chatService.getConversation(conversationId);
    },
    enabled: !!conversationId,
  });
};

/**
 * Hook pour créer une nouvelle conversation
 */
export const useCreateConversation = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (input: CreateConversationInput) => {
      if (!user) throw new Error('User not authenticated');
      return chatService.createConversation(user.id, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};

/**
 * Hook pour mettre à jour une conversation (groupe)
 */
export const useUpdateConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ conversationId, updates }: { 
      conversationId: string; 
      updates: { name?: string; image_url?: string } 
    }) => {
      return chatService.updateConversation(conversationId, updates);
    },
    onSuccess: (_, { conversationId }) => {
      queryClient.invalidateQueries({ queryKey: ['conversation', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};

/**
 * Hook pour quitter une conversation
 */
export const useLeaveConversation = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (conversationId: string) => {
      if (!user) throw new Error('User not authenticated');
      return chatService.leaveConversation(conversationId, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};

// =============================================
// MESSAGES HOOKS
// =============================================

/**
 * Hook pour récupérer les messages d'une conversation avec pagination infinie
 */
export const useMessages = (conversationId: string | null, limit: number = 50) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useInfiniteQuery({
    queryKey: ['messages', conversationId],
    queryFn: async ({ pageParam }) => {
      if (!conversationId) return [];
      return chatService.getMessages(conversationId, limit, pageParam);
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.length < limit) return undefined;
      return lastPage[0]?.id; // ID du premier message (plus ancien) pour charger les précédents
    },
    initialPageParam: undefined as string | undefined,
    enabled: !!conversationId,
  });

  // S'abonner aux nouveaux messages en temps réel
  useEffect(() => {
    if (!conversationId || !user) return;

    const unsubscribe = chatService.subscribeToMessages(conversationId, (newMessage) => {
      // Ajouter le nouveau message au cache
      queryClient.setQueryData(
        ['messages', conversationId],
        (oldData: any) => {
          if (!oldData) return { pages: [[newMessage]], pageParams: [undefined] };
          
          // Ajouter le nouveau message à la dernière page
          const newPages = [...oldData.pages];
          const lastPageIndex = newPages.length - 1;
          newPages[lastPageIndex] = [...newPages[lastPageIndex], newMessage];
          
          return { ...oldData, pages: newPages };
        }
      );

      // Marquer comme lu si c'est un message d'un autre utilisateur
      if (newMessage.sender_id !== user.id) {
        chatService.markAsRead(conversationId, user.id);
      }

      // Mettre à jour la liste des conversations
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    });

    return unsubscribe;
  }, [conversationId, user, queryClient]);

  // Tous les messages (aplatis)
  const allMessages = query.data?.pages.flat() || [];

  return {
    ...query,
    messages: allMessages,
    loadMore: query.fetchNextPage,
    hasMore: query.hasNextPage,
  };
};

/**
 * Hook pour envoyer un message
 */
export const useSendMessage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (input: SendMessageInput) => {
      if (!user) throw new Error('User not authenticated');
      return chatService.sendMessage(user.id, input);
    },
    onMutate: async (input) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['messages', input.conversation_id] });
      
      const previousMessages = queryClient.getQueryData(['messages', input.conversation_id]);
      
      // Ajouter le message de façon optimiste
      if (user) {
        const optimisticMessage: Message = {
          id: `temp-${Date.now()}`,
          conversation_id: input.conversation_id,
          sender_id: user.id,
          content: input.content || null,
          media_url: input.media_url || null,
          media_type: input.media_type || null,
          is_deleted: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          sender: {
            id: user.id,
            username: user.email?.split('@')[0] || 'You',
            avatar_url: null
          }
        };

        queryClient.setQueryData(
          ['messages', input.conversation_id],
          (oldData: any) => {
            if (!oldData) return { pages: [[optimisticMessage]], pageParams: [undefined] };
            
            const newPages = [...oldData.pages];
            const lastPageIndex = newPages.length - 1;
            newPages[lastPageIndex] = [...newPages[lastPageIndex], optimisticMessage];
            
            return { ...oldData, pages: newPages };
          }
        );
      }

      return { previousMessages };
    },
    onError: (_, input, context) => {
      // Rollback en cas d'erreur
      if (context?.previousMessages) {
        queryClient.setQueryData(['messages', input.conversation_id], context.previousMessages);
      }
    },
    onSuccess: (_, input) => {
      queryClient.invalidateQueries({ queryKey: ['messages', input.conversation_id] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};

/**
 * Hook pour supprimer un message
 */
export const useDeleteMessage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({ messageId, conversationId }: { messageId: string; conversationId: string }) => {
      if (!user) throw new Error('User not authenticated');
      return chatService.deleteMessage(messageId, user.id);
    },
    onSuccess: (_, { conversationId }) => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
    },
  });
};

// =============================================
// LECTURE / NON-LUS HOOKS
// =============================================

/**
 * Hook pour marquer une conversation comme lue
 */
export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (conversationId: string) => {
      if (!user) throw new Error('User not authenticated');
      return chatService.markAsRead(conversationId, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};

/**
 * Hook pour obtenir le nombre total de messages non lus
 */
export const useTotalUnreadCount = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['unread-count', user?.id],
    queryFn: () => {
      if (!user) return 0;
      return chatService.getTotalUnreadCount(user.id);
    },
    enabled: !!user,
    refetchInterval: 30000,
  });
};

// =============================================
// TYPING INDICATOR HOOKS
// =============================================

/**
 * Hook pour gérer l'indicateur de saisie
 */
export const useTypingIndicator = (conversationId: string | null) => {
  const { user } = useAuth();
  const [isTyping, setIsTyping] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startTyping = useCallback(async () => {
    if (!conversationId || !user) return;

    // Si déjà en train d'écrire, juste reset le timeout
    if (isTyping) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    } else {
      setIsTyping(true);
      await chatService.setTypingIndicator(conversationId, user.id, true);
    }

    // Reset après 5 secondes d'inactivité
    timeoutRef.current = setTimeout(async () => {
      setIsTyping(false);
      await chatService.setTypingIndicator(conversationId, user.id, false);
    }, 5000);
  }, [conversationId, user, isTyping]);

  const stopTyping = useCallback(async () => {
    if (!conversationId || !user) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setIsTyping(false);
    await chatService.setTypingIndicator(conversationId, user.id, false);
  }, [conversationId, user]);

  // Nettoyer au démontage
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (conversationId && user) {
        chatService.setTypingIndicator(conversationId, user.id, false);
      }
    };
  }, [conversationId, user]);

  return { startTyping, stopTyping, isTyping };
};

/**
 * Hook pour écouter les indicateurs de saisie des autres utilisateurs
 */
export const useTypingIndicators = (conversationId: string | null) => {
  const { user } = useAuth();
  const [typingUsers, setTypingUsers] = useState<TypingIndicator[]>([]);

  useEffect(() => {
    if (!conversationId || !user) {
      setTypingUsers([]);
      return;
    }

    const unsubscribe = chatService.subscribeToTypingIndicators(
      conversationId,
      user.id,
      setTypingUsers
    );

    return unsubscribe;
  }, [conversationId, user]);

  return typingUsers;
};

// =============================================
// READ RECEIPTS HOOKS
// =============================================

/**
 * Hook pour écouter les indicateurs de lecture
 */
export const useReadReceipts = (conversationId: string | null) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!conversationId) return;

    const unsubscribe = chatService.subscribeToReadReceipts(
      conversationId,
      () => {
        queryClient.invalidateQueries({ queryKey: ['conversation', conversationId] });
      }
    );

    return unsubscribe;
  }, [conversationId, queryClient]);
};

// =============================================
// SEARCH HOOKS
// =============================================

/**
 * Hook pour rechercher des utilisateurs
 */
export const useSearchUsers = (query: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['search-users', query],
    queryFn: () => {
      if (!user || !query.trim()) return [];
      return chatService.searchUsers(query, user.id);
    },
    enabled: !!user && query.trim().length >= 2,
  });
};

// =============================================
// MEDIA UPLOAD HOOK
// =============================================

/**
 * Hook pour uploader un média dans le chat
 */
export const useUploadChatMedia = () => {
  const { user } = useAuth();

  return useMutation({
    mutationFn: (file: File) => {
      if (!user) throw new Error('User not authenticated');
      return chatService.uploadMedia(user.id, file);
    },
  });
};

