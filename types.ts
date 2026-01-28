
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
