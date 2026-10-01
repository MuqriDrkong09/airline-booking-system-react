import type { AppNotification } from '../types/notification';
import type { NotificationsApi } from './notificationsApi.types';
import {
  cloneSeedNotifications,
  countUnreadNotifications,
  sortNotificationsByNewest,
} from './notificationsData';

const MOCK_DELAY_MS = 250;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function createMockNotificationsApi(
  options: { delayMs?: number; initial?: AppNotification[] } = {},
): NotificationsApi & { reset: () => void; getState: () => AppNotification[] } {
  const delayMs = options.delayMs ?? MOCK_DELAY_MS;
  let notifications = options.initial
    ? options.initial.map((item) => ({ ...item }))
    : cloneSeedNotifications();

  const api: NotificationsApi & { reset: () => void; getState: () => AppNotification[] } = {
    reset() {
      notifications = options.initial
        ? options.initial.map((item) => ({ ...item }))
        : cloneSeedNotifications();
    },

    getState() {
      return notifications.map((item) => ({ ...item }));
    },

    async listNotifications(): Promise<AppNotification[]> {
      await delay(delayMs);
      return sortNotificationsByNewest(notifications);
    },

    async getUnreadCount(): Promise<number> {
      await delay(delayMs);
      return countUnreadNotifications(notifications);
    },

    async markAsRead(notificationId: string): Promise<AppNotification> {
      await delay(delayMs);
      const target = notifications.find((item) => item.id === notificationId);

      if (!target) {
        throw new Error('Notification not found.');
      }

      if (target.readAt === null) {
        target.readAt = new Date().toISOString();
      }

      return { ...target };
    },

    async markAllAsRead(): Promise<AppNotification[]> {
      await delay(delayMs);
      const now = new Date().toISOString();
      notifications = notifications.map((item) =>
        item.readAt === null ? { ...item, readAt: now } : item,
      );
      return sortNotificationsByNewest(notifications);
    },

    async deleteNotification(notificationId: string): Promise<void> {
      await delay(delayMs);
      const next = notifications.filter((item) => item.id !== notificationId);

      if (next.length === notifications.length) {
        throw new Error('Notification not found.');
      }

      notifications = next;
    },
  };

  return api;
}

export const mockNotificationsApi = createMockNotificationsApi();
