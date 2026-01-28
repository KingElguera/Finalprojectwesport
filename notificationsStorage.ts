import { Notification } from './lib/types';

const STORAGE_KEY = 'wesport_notifications';

/**
 * Charge toutes les notifications depuis localStorage
 */
export const loadNotifications = (): Notification[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as Notification[];
    }
  } catch (error) {
    console.error('Erreur lors du chargement des notifications:', error);
  }
  return [];
};

/**
 * Sauvegarde toutes les notifications dans localStorage
 */
const saveNotifications = (notifications: Notification[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des notifications:', error);
  }
};

/**
 * Ajoute une nouvelle notification
 */
export const addNotification = (notification: Notification): void => {
  const notifications = loadNotifications();
  notifications.unshift(notification); // Ajouter au début
  saveNotifications(notifications);
};

/**
 * Marque une notification comme lue
 */
export const markNotificationAsRead = (notificationId: string): void => {
  const notifications = loadNotifications();
  const updated = notifications.map(notif =>
    notif.id === notificationId ? { ...notif, read: true } : notif
  );
  saveNotifications(updated);
};

/**
 * Marque toutes les notifications comme lues
 */
export const markAllAsRead = (): void => {
  const notifications = loadNotifications();
  const updated = notifications.map(notif => ({ ...notif, read: true }));
  saveNotifications(updated);
};

/**
 * Supprime une notification
 */
export const deleteNotification = (notificationId: string): void => {
  const notifications = loadNotifications();
  const updated = notifications.filter(notif => notif.id !== notificationId);
  saveNotifications(updated);
};

/**
 * Supprime toutes les notifications
 */
export const clearAllNotifications = (): void => {
  saveNotifications([]);
};

/**
 * Obtient le nombre de notifications non lues
 */
export const getUnreadCount = (): number => {
  const notifications = loadNotifications();
  return notifications.filter(notif => !notif.read).length;
};
