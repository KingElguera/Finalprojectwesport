export type MediaType = 'video' | 'image';
export type SportType = 'football' | 'basketball' | 'fitness' | 'running' | 'tennis' | 'extreme' | 'other';
export type ViewType = 'feed' | 'menu' | 'profile' | 'chat' | 'map' | 'challenges' | 'settings' | 'userProfile';
export type UserListType = 'followers' | 'following';
export type NotificationType = 'like' | 'comment' | 'follow';

export interface User {
  id: string;
  username: string;
  avatarUrl: string;
  bio?: string;
  isFollowing?: boolean; // Pour la liste "following", indique si on suit cette personne
}

export interface Profile {
  username: string;
  bio: string;
  avatarUrl: string;
  usernameChangeHistory: number[]; // Timestamps des changements de pseudo (en millisecondes)
}

export interface Notification {
  id: string;
  type: NotificationType;
  actorUser: User; // L'utilisateur qui a effectué l'action
  postId?: string; // ID du post concerné (pour like et comment)
  commentText?: string; // Texte du commentaire (pour type comment)
  createdAt: number; // Timestamp en millisecondes
  read?: boolean; // Si la notification a été lue
}

export interface WeSportPostData {
  id: string;
  mediaType: MediaType;
  mediaUrl: string;
  username: string;
  userAvatarUrl: string;
  sport: SportType;
  description: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isSaved?: boolean;
  createdAt: string;
}

// Types pour la géolocalisation et les lieux sportifs
export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Location {
  id: string;
  name: string;
  type: string;
  coordinates: Coordinates;
  address?: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Checkin {
  id: string;
  user_id: string;
  location_id: string;
  start_time: string;
  end_time?: string;
  is_public: boolean;
  message?: string;
  created_at: string;
  updated_at: string;
}

// =============================================
// Types pour le Chat / Messagerie
// =============================================

export type ConversationType = 'direct' | 'group';
export type MessageMediaType = 'image' | 'video';

export interface Conversation {
  id: string;
  type: ConversationType;
  name: string | null; // Nom du groupe (null pour les conversations directes)
  image_url: string | null; // Image du groupe
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Champs calculés/joints
  last_message_content?: string | null;
  last_message_sender_id?: string | null;
  last_message_created_at?: string | null;
  unread_count?: number;
  // Pour les conversations directes
  other_participant_id?: string | null;
  other_participant_username?: string | null;
  other_participant_avatar?: string | null;
  // Participants (pour les groupes)
  participants?: ConversationParticipant[];
}

export interface ConversationParticipant {
  id: string;
  conversation_id: string;
  user_id: string;
  joined_at: string;
  last_read_at: string;
  is_admin: boolean;
  // Données du profil jointes
  profile?: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string | null;
  content: string | null;
  media_url: string | null;
  media_type: MessageMediaType | null;
  shared_post_id: string | null; // ID du post partagé (si message de partage)
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  // Données du sender jointes
  sender?: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
  // Données du post partagé (si applicable)
  shared_post?: {
    id: string;
    media_type: string;
    media_url: string;
    description: string | null;
    sport_type: string;
    user: {
      id: string;
      username: string;
      avatar_url: string | null;
    };
  };
}

export interface TypingIndicator {
  id: string;
  conversation_id: string;
  user_id: string;
  is_typing: boolean;
  updated_at: string;
  // Données du profil jointes
  profile?: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
}

// Types pour les requêtes
export interface CreateConversationInput {
  type: ConversationType;
  name?: string;
  image_url?: string;
  participant_ids: string[]; // IDs des utilisateurs à ajouter
}

export interface SendMessageInput {
  conversation_id: string;
  content?: string;
  media_url?: string;
  media_type?: MessageMediaType;
  shared_post_id?: string; // ID du post à partager
}

