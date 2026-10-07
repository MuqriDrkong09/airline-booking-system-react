import type { AxiosInstance } from 'axios';
import type { NotificationsApi } from '@/features/notifications/api/notificationsApi.types';
import type { AppNotification } from '@/features/notifications/types/notification';
import { API_ENDPOINTS, apiClient, toApiError } from '@/services/api';

export function createHttpNotificationApi(
  client: AxiosInstance = apiClient,
): NotificationsApi {
  return {
    async listNotifications(): Promise<AppNotification[]> {
      try {
        const { data } = await client.get<AppNotification[]>(API_ENDPOINTS.notifications.root);
        return data;
      } catch (error) {
        throw toApiError(error);
      }
    },

    async getUnreadCount(): Promise<number> {
      try {
        const { data } = await client.get<{ count: number }>(
          API_ENDPOINTS.notifications.unreadCount,
        );
        return data.count;
      } catch (error) {
        throw toApiError(error);
      }
    },

    async markAsRead(notificationId: string): Promise<AppNotification> {
      try {
        const { data } = await client.post<AppNotification>(
          API_ENDPOINTS.notifications.read(notificationId),
        );
        return data;
      } catch (error) {
        throw toApiError(error);
      }
    },

    async markAllAsRead(): Promise<AppNotification[]> {
      try {
        const { data } = await client.post<AppNotification[]>(
          API_ENDPOINTS.notifications.readAll,
        );
        return data;
      } catch (error) {
        throw toApiError(error);
      }
    },

    async deleteNotification(notificationId: string): Promise<void> {
      try {
        await client.delete(API_ENDPOINTS.notifications.byId(notificationId));
      } catch (error) {
        throw toApiError(error);
      }
    },
  };
}
