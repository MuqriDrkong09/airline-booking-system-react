import type { AppNotification } from '../types/notification';

export interface NotificationsApi {
  listNotifications: () => Promise<AppNotification[]>;
  getUnreadCount: () => Promise<number>;
  markAsRead: (notificationId: string) => Promise<AppNotification>;
  markAllAsRead: () => Promise<AppNotification[]>;
  deleteNotification: (notificationId: string) => Promise<void>;
}
