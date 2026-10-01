import Stack from '@mui/material/Stack';
import { AppButton, EmptyState, ErrorState, PageLoader } from '@/components/common';
import {
  useDeleteNotificationMutation,
  useMarkAllNotificationsAsReadMutation,
  useMarkNotificationAsReadMutation,
  useNotificationsQuery,
  useUnreadNotificationCountQuery,
} from '../hooks/useNotifications';
import { NotificationCard } from './NotificationCard';

export function NotificationsView() {
  const listQuery = useNotificationsQuery();
  const unreadQuery = useUnreadNotificationCountQuery();
  const markAsRead = useMarkNotificationAsReadMutation();
  const markAllAsRead = useMarkAllNotificationsAsReadMutation();
  const deleteNotification = useDeleteNotificationMutation();

  const notifications = listQuery.data ?? [];
  const unreadCount = unreadQuery.data ?? 0;

  if (listQuery.isLoading) {
    return <PageLoader label="Loading notifications" />;
  }

  if (listQuery.isError) {
    return (
      <ErrorState
        title="Unable to load notifications"
        message="Please try again in a moment."
        onRetry={() => {
          void listQuery.refetch();
        }}
      />
    );
  }

  if (notifications.length === 0) {
    return (
      <EmptyState
        title="No notifications yet"
        message="Updates about bookings, payments, check-in, and flights will show up here."
      />
    );
  }

  return (
    <Stack spacing={2}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        sx={{ justifyContent: 'flex-end' }}
      >        <AppButton
          variant="outlined"
          onClick={() => markAllAsRead.mutate()}
          disabled={unreadCount === 0}
          loading={markAllAsRead.isPending}
          loadingLabel="Marking as read"
        >
          Mark all as read
        </AppButton>
      </Stack>

      <Stack spacing={1.5}>
        {notifications.map((notification) => (
          <NotificationCard
            key={notification.id}
            notification={notification}
            onMarkAsRead={(notificationId) => markAsRead.mutate(notificationId)}
            onDelete={(notificationId) => deleteNotification.mutate(notificationId)}
            markAsReadPending={
              markAsRead.isPending && markAsRead.variables === notification.id
            }
            deletePending={
              deleteNotification.isPending &&
              deleteNotification.variables === notification.id
            }
          />
        ))}
      </Stack>
    </Stack>
  );
}
