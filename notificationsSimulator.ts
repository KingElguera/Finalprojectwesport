import { Notification, User, WeSportPostData } from './lib/types';
import { MOCK_POSTS, MOCK_FOLLOWERS } from './lib/constants';
import { addNotification } from './notificationsStorage';

// Commentaires mockés pour les notifications de commentaires
const MOCK_COMMENTS = [
  'Super performance ! 🔥',
  'Bravo pour ce PR ! 💪',
  'Impressionnant ! 👏',
  'Continue comme ça ! 🚀',
  'Tu es une source d\'inspiration ! ⭐',
  'Excellent travail ! 🎯',
  'Wow ! 🤩',
  'Félicitations ! 🎉',
];

/**
 * Génère une notification de like aléatoire
 */
export const simulateLikeNotification = (): void => {
  const randomPost = MOCK_POSTS[Math.floor(Math.random() * MOCK_POSTS.length)];
  const randomUser = MOCK_FOLLOWERS[Math.floor(Math.random() * MOCK_FOLLOWERS.length)];

  const notification: Notification = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: 'like',
    actorUser: randomUser,
    postId: randomPost.id,
    createdAt: Date.now(),
    read: false,
  };

  addNotification(notification);
};

/**
 * Génère une notification de commentaire aléatoire
 */
export const simulateCommentNotification = (): void => {
  const randomPost = MOCK_POSTS[Math.floor(Math.random() * MOCK_POSTS.length)];
  const randomUser = MOCK_FOLLOWERS[Math.floor(Math.random() * MOCK_FOLLOWERS.length)];
  const randomComment = MOCK_COMMENTS[Math.floor(Math.random() * MOCK_COMMENTS.length)];

  const notification: Notification = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: 'comment',
    actorUser: randomUser,
    postId: randomPost.id,
    commentText: randomComment,
    createdAt: Date.now(),
    read: false,
  };

  addNotification(notification);
};

/**
 * Génère une notification d'abonnement aléatoire
 */
export const simulateFollowNotification = (): void => {
  const randomUser = MOCK_FOLLOWERS[Math.floor(Math.random() * MOCK_FOLLOWERS.length)];

  const notification: Notification = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: 'follow',
    actorUser: randomUser,
    createdAt: Date.now(),
    read: false,
  };

  addNotification(notification);
};

/**
 * Génère une notification aléatoire (like, comment ou follow)
 */
export const simulateRandomNotification = (): void => {
  const types: Array<'like' | 'comment' | 'follow'> = ['like', 'comment', 'follow'];
  const randomType = types[Math.floor(Math.random() * types.length)];

  switch (randomType) {
    case 'like':
      simulateLikeNotification();
      break;
    case 'comment':
      simulateCommentNotification();
      break;
    case 'follow':
      simulateFollowNotification();
      break;
  }
};
