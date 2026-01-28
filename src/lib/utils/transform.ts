import { WeSportPostData, SportType, MediaType, Notification, User, NotificationType } from '@/lib/types';

// Type pour les données Supabase (à adapter selon les types générés)
type SupabasePost = {
  id: string;
  media_type: 'image' | 'video';
  media_url: string;
  sport_type: string;
  description: string | null;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  created_at: string;
  profiles: {
    id: string;
    username: string;
    avatar_url: string | null;
  } | null;
};

type SupabaseComment = {
  id: string;
  text: string;
  created_at: string;
  profiles: {
    id: string;
    username: string;
    avatar_url: string | null;
  } | null;
};

/**
 * Transforme un post Supabase en WeSportPostData
 */
export function transformPost(post: SupabasePost): WeSportPostData {
  return {
    id: post.id,
    mediaType: post.media_type as MediaType,
    mediaUrl: post.media_url,
    username: post.profiles?.username || 'unknown',
    userAvatarUrl: post.profiles?.avatar_url || '',
    sport: post.sport_type as SportType,
    description: post.description || '',
    likesCount: post.likes_count || 0,
    commentsCount: post.comments_count || 0,
    sharesCount: post.shares_count || 0,
    createdAt: post.created_at,
  };
}

/**
 * Transforme une liste de posts Supabase
 */
export function transformPosts(posts: SupabasePost[]): WeSportPostData[] {
  return posts.map(transformPost);
}

/**
 * Formate un timestamp en temps relatif
 */
export function formatTimeAgo(timestamp: string | number): string {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : new Date(timestamp);
  const now = Date.now();
  const diff = now - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'À l\'instant';
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}j`;
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

/**
 * Transforme un commentaire Supabase en format utilisable
 */
export function transformComment(comment: SupabaseComment) {
  return {
    id: comment.id,
    username: comment.profiles?.username || 'unknown',
    avatarUrl: comment.profiles?.avatar_url || '',
    text: comment.text,
    time: formatTimeAgo(comment.created_at),
    createdAt: comment.created_at,
  };
}

/**
 * Transforme une liste de commentaires
 */
export function transformComments(comments: SupabaseComment[]) {
  return comments.map(transformComment);
}

// Types pour les notifications Supabase
type SupabaseNotification = {
  id: string;
  type: 'like' | 'comment' | 'follow';
  post_id: string | null;
  comment_text: string | null;
  read: boolean;
  created_at: string;
  profiles: {
    id: string;
    username: string;
    avatar_url: string | null;
  } | null;
};

/**
 * Transforme une notification Supabase en Notification
 */
export function transformNotification(notif: SupabaseNotification): Notification {
  return {
    id: notif.id,
    type: notif.type as NotificationType,
    actorUser: {
      id: notif.profiles?.id || '',
      username: notif.profiles?.username || 'unknown',
      avatarUrl: notif.profiles?.avatar_url || '',
    },
    postId: notif.post_id || undefined,
    commentText: notif.comment_text || undefined,
    createdAt: new Date(notif.created_at).getTime(),
    read: notif.read,
  };
}

/**
 * Transforme une liste de notifications
 */
export function transformNotifications(notifications: SupabaseNotification[]): Notification[] {
  return notifications.map(transformNotification);
}

// Types pour les followers/following
type SupabaseFollower = {
  follower_id: string;
  profiles: {
    id: string;
    username: string;
    avatar_url: string | null;
    bio: string | null;
  } | null;
};

type SupabaseFollowing = {
  following_id: string;
  profiles: {
    id: string;
    username: string;
    avatar_url: string | null;
    bio: string | null;
  } | null;
};

/**
 * Transforme un follower Supabase en User
 */
export function transformFollower(follower: SupabaseFollower): User {
  return {
    id: follower.profiles?.id || follower.follower_id,
    username: follower.profiles?.username || 'unknown',
    avatarUrl: follower.profiles?.avatar_url || '',
    bio: follower.profiles?.bio || undefined,
    isFollowing: false,
  };
}

/**
 * Transforme un following Supabase en User
 */
export function transformFollowing(following: SupabaseFollowing): User {
  return {
    id: following.profiles?.id || following.following_id,
    username: following.profiles?.username || 'unknown',
    avatarUrl: following.profiles?.avatar_url || '',
    bio: following.profiles?.bio || undefined,
    isFollowing: true,
  };
}

/**
 * Transforme une liste de followers
 */
export function transformFollowers(followers: SupabaseFollower[]): User[] {
  return followers.map(transformFollower);
}

/**
 * Transforme une liste de following
 */
export function transformFollowingList(following: SupabaseFollowing[]): User[] {
  return following.map(transformFollowing);
}

