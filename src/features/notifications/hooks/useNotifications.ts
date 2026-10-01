import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AppNotification } from '../types/notification';
import {
  deleteNotification,
  getUnreadNotificationCount,
  listNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  notificationKeys,
} from '../api';

export function useNotificationsQuery(enabled = true) {
  return useQuery({
    queryKey: notificationKeys.list(),
    queryFn: listNotifications,
    enabled,
  });
}

export function useUnreadNotificationCountQuery(enabled = true) {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: getUnreadNotificationCount,
    enabled,
    refetchInterval: 60_000,
  });
}

function syncUnreadCount(
  queryClient: ReturnType<typeof useQueryClient>,
  notifications: AppNotification[] | undefined,
) {
  if (!notifications) {
    void queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
    return;
  }

  queryClient.setQueryData(
    notificationKeys.unreadCount(),
    notifications.filter((item) => item.readAt === null).length,
  );
}

export function useMarkNotificationAsReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => markNotificationAsRead(notificationId),
    onSuccess: (updated) => {
      queryClient.setQueryData<AppNotification[]>(notificationKeys.list(), (current) => {
        if (!current) {
          return current;
        }

        return current.map((item) => (item.id === updated.id ? updated : item));
      });
      syncUnreadCount(queryClient, queryClient.getQueryData(notificationKeys.list()));
    },
  });
}

export function useMarkAllNotificationsAsReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => markAllNotificationsAsRead(),
    onSuccess: (notifications) => {
      queryClient.setQueryData(notificationKeys.list(), notifications);
      queryClient.setQueryData(notificationKeys.unreadCount(), 0);
    },
  });
}

export function useDeleteNotificationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => deleteNotification(notificationId),
    onSuccess: (_void, notificationId) => {
      queryClient.setQueryData<AppNotification[]>(notificationKeys.list(), (current) => {
        if (!current) {
          return current;
        }

        return current.filter((item) => item.id !== notificationId);
      });
      syncUnreadCount(queryClient, queryClient.getQueryData(notificationKeys.list()));
    },
  });
}
