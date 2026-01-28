import { createClient } from '@/lib/supabase/client';
import type { 
  Conversation, 
  Message, 
  ConversationParticipant,
  TypingIndicator,
  CreateConversationInput,
  SendMessageInput 
} from '@/lib/types';

export const chatService = {
  // =============================================
  // CONVERSATIONS
  // =============================================

  /**
   * Récupère toutes les conversations de l'utilisateur
   */
  async getConversations(userId: string): Promise<Conversation[]> {
    const supabase = createClient();
    
    const { data, error } = await supabase.rpc('get_user_conversations', {
      p_user_id: userId
    });

    if (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }

    return data || [];
  },

  /**
   * Récupère une conversation par son ID
   */
  async getConversation(conversationId: string): Promise<Conversation | null> {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        conversation_participants (
          *,
          profile:profiles (
            id,
            username,
            avatar_url
          )
        )
      `)
      .eq('id', conversationId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    return {
      ...data,
      participants: data.conversation_participants
    } as Conversation;
  },

  /**
   * Crée une nouvelle conversation
   */
  async createConversation(userId: string, input: CreateConversationInput): Promise<Conversation> {
    const supabase = createClient();

    // Pour les conversations directes, utiliser la fonction SQL
    if (input.type === 'direct' && input.participant_ids.length === 1) {
      const { data: conversationId, error: rpcError } = await supabase.rpc(
        'find_or_create_direct_conversation',
        {
          user1_id: userId,
          user2_id: input.participant_ids[0]
        }
      );

      if (rpcError) throw rpcError;

      const conversation = await this.getConversation(conversationId);
      if (!conversation) throw new Error('Failed to create conversation');
      return conversation;
    }

    // Pour les groupes
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .insert({
        type: input.type,
        name: input.name || null,
        image_url: input.image_url || null,
        created_by: userId
      })
      .select()
      .single();

    if (convError) throw convError;

    // Ajouter tous les participants (incluant le créateur)
    const allParticipantIds = [userId, ...input.participant_ids];
    const participantsToInsert = allParticipantIds.map((participantId, index) => ({
      conversation_id: conversation.id,
      user_id: participantId,
      is_admin: index === 0 // Le créateur est admin
    }));

    const { error: participantsError } = await supabase
      .from('conversation_participants')
      .insert(participantsToInsert);

    if (participantsError) throw participantsError;

    return this.getConversation(conversation.id) as Promise<Conversation>;
  },

  /**
   * Met à jour une conversation de groupe
   */
  async updateConversation(
    conversationId: string,
    updates: { name?: string; image_url?: string }
  ): Promise<Conversation> {
    const supabase = createClient();

    const { error } = await supabase
      .from('conversations')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', conversationId);

    if (error) throw error;

    return this.getConversation(conversationId) as Promise<Conversation>;
  },

  /**
   * Quitte une conversation (pour les groupes)
   */
  async leaveConversation(conversationId: string, userId: string): Promise<void> {
    const supabase = createClient();

    const { error } = await supabase
      .from('conversation_participants')
      .delete()
      .eq('conversation_id', conversationId)
      .eq('user_id', userId);

    if (error) throw error;
  },

  /**
   * Ajoute un participant à un groupe
   */
  async addParticipant(conversationId: string, userId: string): Promise<void> {
    const supabase = createClient();

    const { error } = await supabase
      .from('conversation_participants')
      .insert({
        conversation_id: conversationId,
        user_id: userId
      });

    if (error) throw error;
  },

  /**
   * Retire un participant d'un groupe
   */
  async removeParticipant(conversationId: string, userId: string): Promise<void> {
    const supabase = createClient();

    const { error } = await supabase
      .from('conversation_participants')
      .delete()
      .eq('conversation_id', conversationId)
      .eq('user_id', userId);

    if (error) throw error;
  },

  /**
   * Récupère les participants d'une conversation
   */
  async getParticipants(conversationId: string): Promise<ConversationParticipant[]> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('conversation_participants')
      .select(`
        *,
        profile:profiles (
          id,
          username,
          avatar_url
        )
      `)
      .eq('conversation_id', conversationId);

    if (error) throw error;

    return data || [];
  },

  // =============================================
  // MESSAGES
  // =============================================

  /**
   * Récupère les messages d'une conversation avec pagination
   */
  async getMessages(
    conversationId: string,
    limit: number = 50,
    before?: string // ID du message pour pagination (charger les messages avant celui-ci)
  ): Promise<Message[]> {
    const supabase = createClient();

    let query = supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey (
          id,
          username,
          avatar_url
        ),
        shared_post:posts!messages_shared_post_id_fkey (
          id,
          media_type,
          media_url,
          description,
          sport_type,
          user:profiles!posts_user_id_fkey (
            id,
            username,
            avatar_url
          )
        )
      `)
      .eq('conversation_id', conversationId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (before) {
      // Récupérer le timestamp du message "before"
      const { data: beforeMsg } = await supabase
        .from('messages')
        .select('created_at')
        .eq('id', before)
        .single();

      if (beforeMsg) {
        query = query.lt('created_at', beforeMsg.created_at);
      }
    }

    const { data, error } = await query;

    if (error) throw error;

    // Retourner les messages dans l'ordre chronologique
    return (data || []).reverse();
  },

  /**
   * Envoie un nouveau message
   */
  async sendMessage(userId: string, input: SendMessageInput): Promise<Message> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: input.conversation_id,
        sender_id: userId,
        content: input.content || null,
        media_url: input.media_url || null,
        media_type: input.media_type || null,
        shared_post_id: input.shared_post_id || null
      })
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey (
          id,
          username,
          avatar_url
        ),
        shared_post:posts!messages_shared_post_id_fkey (
          id,
          media_type,
          media_url,
          description,
          sport_type,
          user:profiles!posts_user_id_fkey (
            id,
            username,
            avatar_url
          )
        )
      `)
      .single();

    if (error) throw error;

    // Mettre à jour last_read_at pour l'expéditeur
    await this.markAsRead(input.conversation_id, userId);

    return data;
  },

  /**
   * Supprime un message (soft delete)
   */
  async deleteMessage(messageId: string, userId: string): Promise<void> {
    const supabase = createClient();

    const { error } = await supabase
      .from('messages')
      .update({
        is_deleted: true,
        content: null,
        media_url: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', messageId)
      .eq('sender_id', userId);

    if (error) throw error;
  },

  // =============================================
  // LECTURE / NON-LUS
  // =============================================

  /**
   * Marque les messages d'une conversation comme lus
   */
  async markAsRead(conversationId: string, userId: string): Promise<void> {
    const supabase = createClient();

    const { error } = await supabase
      .from('conversation_participants')
      .update({
        last_read_at: new Date().toISOString()
      })
      .eq('conversation_id', conversationId)
      .eq('user_id', userId);

    if (error) throw error;
  },

  /**
   * Récupère le nombre de messages non lus pour une conversation
   */
  async getUnreadCount(conversationId: string, userId: string): Promise<number> {
    const supabase = createClient();

    const { data, error } = await supabase.rpc('get_unread_count', {
      p_conversation_id: conversationId,
      p_user_id: userId
    });

    if (error) throw error;

    return data || 0;
  },

  /**
   * Récupère le nombre total de messages non lus pour toutes les conversations
   */
  async getTotalUnreadCount(userId: string): Promise<number> {
    const conversations = await this.getConversations(userId);
    return conversations.reduce((total, conv) => total + (conv.unread_count || 0), 0);
  },

  // =============================================
  // INDICATEURS DE SAISIE (TYPING)
  // =============================================

  /**
   * Met à jour l'indicateur de saisie
   */
  async setTypingIndicator(
    conversationId: string,
    userId: string,
    isTyping: boolean
  ): Promise<void> {
    const supabase = createClient();

    if (isTyping) {
      // Upsert l'indicateur
      const { error } = await supabase
        .from('typing_indicators')
        .upsert({
          conversation_id: conversationId,
          user_id: userId,
          is_typing: true,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'conversation_id,user_id'
        });

      if (error) throw error;
    } else {
      // Supprimer l'indicateur
      const { error } = await supabase
        .from('typing_indicators')
        .delete()
        .eq('conversation_id', conversationId)
        .eq('user_id', userId);

      if (error) throw error;
    }
  },

  /**
   * Récupère les indicateurs de saisie d'une conversation
   */
  async getTypingIndicators(conversationId: string): Promise<TypingIndicator[]> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('typing_indicators')
      .select(`
        *,
        profile:profiles (
          id,
          username,
          avatar_url
        )
      `)
      .eq('conversation_id', conversationId)
      .eq('is_typing', true)
      .gt('updated_at', new Date(Date.now() - 10000).toISOString()); // Moins de 10 secondes

    if (error) throw error;

    return data || [];
  },

  // =============================================
  // UPLOAD DE MÉDIAS
  // =============================================

  /**
   * Upload un média pour un message
   */
  async uploadMedia(userId: string, file: File): Promise<string> {
    const supabase = createClient();
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('chat-media')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('chat-media')
      .getPublicUrl(fileName);

    return publicUrl;
  },

  // =============================================
  // SUBSCRIPTIONS TEMPS RÉEL
  // =============================================

  /**
   * S'abonne aux nouveaux messages d'une conversation
   */
  subscribeToMessages(
    conversationId: string,
    callback: (message: Message) => void
  ): () => void {
    const supabase = createClient();

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        async (payload) => {
          // Récupérer le message complet avec les données du sender et du post partagé
          const { data } = await supabase
            .from('messages')
            .select(`
              *,
              sender:profiles!messages_sender_id_fkey (
                id,
                username,
                avatar_url
              ),
              shared_post:posts!messages_shared_post_id_fkey (
                id,
                media_type,
                media_url,
                description,
                sport_type,
                user:profiles!posts_user_id_fkey (
                  id,
                  username,
                  avatar_url
                )
              )
            `)
            .eq('id', payload.new.id)
            .single();

          if (data) {
            callback(data);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  /**
   * S'abonne aux mises à jour des conversations (nouveaux messages, etc.)
   */
  subscribeToConversations(
    userId: string,
    callback: (conversation: Conversation) => void
  ): () => void {
    const supabase = createClient();

    const channel = supabase
      .channel(`conversations:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations'
        },
        async () => {
          // Recharger les conversations
          const conversations = await this.getConversations(userId);
          conversations.forEach(callback);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  /**
   * S'abonne aux indicateurs de saisie d'une conversation
   */
  subscribeToTypingIndicators(
    conversationId: string,
    userId: string,
    callback: (indicators: TypingIndicator[]) => void
  ): () => void {
    const supabase = createClient();

    const channel = supabase
      .channel(`typing:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'typing_indicators',
          filter: `conversation_id=eq.${conversationId}`
        },
        async () => {
          // Récupérer tous les indicateurs (sauf le sien)
          const indicators = await this.getTypingIndicators(conversationId);
          callback(indicators.filter(i => i.user_id !== userId));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  /**
   * S'abonne aux changements de lecture (pour les indicateurs "vu")
   */
  subscribeToReadReceipts(
    conversationId: string,
    callback: (participants: ConversationParticipant[]) => void
  ): () => void {
    const supabase = createClient();

    const channel = supabase
      .channel(`read:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversation_participants',
          filter: `conversation_id=eq.${conversationId}`
        },
        async () => {
          const participants = await this.getParticipants(conversationId);
          callback(participants);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  // =============================================
  // RECHERCHE
  // =============================================

  /**
   * Recherche des utilisateurs pour démarrer une conversation
   */
  async searchUsers(query: string, currentUserId: string, limit: number = 10): Promise<Array<{
    id: string;
    username: string;
    avatar_url: string | null;
  }>> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .neq('id', currentUserId)
      .ilike('username', `%${query}%`)
      .limit(limit);

    if (error) throw error;

    return data || [];
  }
};

