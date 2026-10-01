import { env } from '@/config/env';
import type { AppNotification } from '../types/notification';
import { createHttpNotificationsApi } from './httpNotificationsApi';
import { mockNotificationsApi } from './mockNotificationsApi';
import type { NotificationsApi } from './notificationsApi.types';

export const notificationsApi: NotificationsApi = env.useMockAuth
  ? mockNotificationsApi
  : createHttpNotificationsApi();

export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: () => [...notificationKeys.lists()] as const,
  unreadCount: () => [...notificationKeys.all, 'unread-count'] as const,
};

export function listNotifications(): Promise<AppNotification[]> {
  return notificationsApi.listNotifications();
}

export function getUnreadNotificationCount(): Promise<number> {
  return notificationsApi.getUnreadCount();
}

export function markNotificationAsRead(notificationId: string): Promise<AppNotification> {
  return notificationsApi.markAsRead(notificationId);
}

export function markAllNotificationsAsRead(): Promise<AppNotification[]> {
  return notificationsApi.markAllAsRead();
}

export function deleteNotification(notificationId: string): Promise<void> {
  return notificationsApi.deleteNotification(notificationId);
}

export type { NotificationsApi } from './notificationsApi.types';
export { createHttpNotificationsApi } from './httpNotificationsApi';
export { createMockNotificationsApi, mockNotificationsApi } from './mockNotificationsApi';
export {
  SEED_NOTIFICATIONS,
  cloneSeedNotifications,
  countUnreadNotifications,
  sortNotificationsByNewest,
} from './notificationsData';
