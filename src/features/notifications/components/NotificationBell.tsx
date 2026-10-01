import Badge from '@mui/material/Badge';
import IconButton from '@mui/material/IconButton';
import { Bell } from 'lucide-react';
import { useId, useState } from 'react';
import {
  useDeleteNotificationMutation,
  useMarkAllNotificationsAsReadMutation,
  useMarkNotificationAsReadMutation,
  useNotificationsQuery,
  useUnreadNotificationCountQuery,
} from '../hooks/useNotifications';
import { NotificationDropdown } from './NotificationDropdown';

export function NotificationBell() {
  const menuId = useId();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const listQuery = useNotificationsQuery(open);
  const unreadQuery = useUnreadNotificationCountQuery();
  const markAsRead = useMarkNotificationAsReadMutation();
  const markAllAsRead = useMarkAllNotificationsAsReadMutation();
  const deleteNotification = useDeleteNotificationMutation();

  const unreadCount = unreadQuery.data ?? 0;
  const notifications = listQuery.data ?? [];

  return (
    <>
      <IconButton
        color="inherit"
        onClick={(event) => setAnchorEl(event.currentTarget)}
        aria-label={
          unreadCount > 0
            ? `Open notifications, ${unreadCount} unread`
            : 'Open notifications'
        }
        aria-controls={open ? menuId : undefined}
        aria-haspopup="menu"
        aria-expanded={open ? 'true' : undefined}
      >
        <Badge
          color="error"
          badgeContent={unreadCount}
          max={99}
          overlap="circular"
          invisible={unreadCount === 0}
        >
          <Bell aria-hidden="true" size={20} />
        </Badge>
      </IconButton>

      <NotificationDropdown
        menuId={menuId}
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        notifications={notifications}
        unreadCount={unreadCount}
        isLoading={listQuery.isLoading || listQuery.isFetching}
        isError={listQuery.isError}
        onRetry={() => {
          void listQuery.refetch();
        }}
        onMarkAsRead={(notificationId) => {
          markAsRead.mutate(notificationId);
        }}
        onMarkAllAsRead={() => {
          markAllAsRead.mutate();
        }}
        onDelete={(notificationId) => {
          deleteNotification.mutate(notificationId);
        }}
        markAllPending={markAllAsRead.isPending}
      />
    </>
  );
}
