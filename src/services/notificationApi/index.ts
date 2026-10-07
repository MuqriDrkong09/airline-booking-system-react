import { env } from '@/config/env';
import type { NotificationsApi } from '@/features/notifications/api/notificationsApi.types';
import { mockNotificationsApi } from '@/features/notifications/api/mockNotificationsApi';
import { createHttpNotificationApi } from './httpNotificationApi';

export const notificationApi: NotificationsApi = env.useMockAuth
  ? mockNotificationsApi
  : createHttpNotificationApi();

export { createHttpNotificationApi };
export type { NotificationsApi };
