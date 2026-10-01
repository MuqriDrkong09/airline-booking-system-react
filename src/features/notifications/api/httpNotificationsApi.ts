import type { AxiosInstance } from 'axios';
import { apiClient } from '@/services/api/client';
import type { AppNotification } from '../types/notification';
import type { NotificationsApi } from './notificationsApi.types';

export function createHttpNotificationsApi(
  client: AxiosInstance = apiClient,
): NotificationsApi {
  return {
    async listNotifications(): Promise<AppNotification[]> {
      const { data } = await client.get<AppNotification[]>('/notifications');
      return data;
    },

    async getUnreadCount(): Promise<number> {
      const { data } = await client.get<{ count: number }>('/notifications/unread-count');
      return data.count;
    },

    async markAsRead(notificationId: string): Promise<AppNotification> {
      const { data } = await client.post<AppNotification>(
        `/notifications/${encodeURIComponent(notificationId)}/read`,
      );
      return data;
    },

    async markAllAsRead(): Promise<AppNotification[]> {
      const { data } = await client.post<AppNotification[]>('/notifications/read-all');
      return data;
    },

    async deleteNotification(notificationId: string): Promise<void> {
      await client.delete(`/notifications/${encodeURIComponent(notificationId)}`);
    },
  };
}
