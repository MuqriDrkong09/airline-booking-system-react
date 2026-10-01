import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Menu from '@mui/material/Menu';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router-dom';
import { AppButton, EmptyState, ErrorState, LoadingSpinner } from '@/components/common';
import { APP_ROUTES } from '@/constants/routes';
import type { AppNotification } from '../types/notification';
import { NotificationCard } from './NotificationCard';

export interface NotificationDropdownProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  menuId: string;
  notifications: AppNotification[];
  unreadCount: number;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
  onDelete: (notificationId: string) => void;
  markAllPending?: boolean;
  previewLimit?: number;
}

export function NotificationDropdown({
  anchorEl,
  open,
  onClose,
  menuId,
  notifications,
  unreadCount,
  isLoading = false,
  isError = false,
  onRetry,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  markAllPending = false,
  previewLimit = 5,
}: NotificationDropdownProps) {
  const preview = notifications.slice(0, previewLimit);

  return (
    <Menu
      id={menuId}
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      slotProps={{
        paper: {
          sx: {
            width: { xs: 'min(100vw - 24px, 380px)', sm: 380 },
            mt: 1,
            p: 0,
          },
        },
        list: {
          'aria-label': 'Notifications',
          sx: { py: 0 },
        },
      }}
    >
      <Box sx={{ px: 2, py: 1.5 }}>
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: 'center', justifyContent: 'space-between' }}
        >          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Notifications
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {unreadCount === 0
                ? 'You are all caught up'
                : `${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}`}
            </Typography>
          </Box>
          {unreadCount > 0 ? (
            <AppButton
              size="small"
              variant="text"
              onClick={onMarkAllAsRead}
              loading={markAllPending}
              loadingLabel="Updating"
            >
              Mark all read
            </AppButton>
          ) : null}
        </Stack>
      </Box>

      <Divider />

      <Box sx={{ maxHeight: 420, overflow: 'auto', px: 1.5, py: 1.5 }}>
        {isLoading ? (
          <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
            <LoadingSpinner label="Loading notifications" />
          </Box>
        ) : null}

        {isError ? (
          <ErrorState
            title="Unable to load notifications"
            message="Please try again in a moment."
            onRetry={onRetry}
          />
        ) : null}

        {!isLoading && !isError && preview.length === 0 ? (
          <EmptyState
            title="No notifications"
            message="Booking and flight updates will appear here."
          />
        ) : null}

        {!isLoading && !isError && preview.length > 0 ? (
          <Stack spacing={1.25}>
            {preview.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                compact
                onMarkAsRead={onMarkAsRead}
                onDelete={onDelete}
                onNavigate={onClose}
              />
            ))}
          </Stack>
        ) : null}
      </Box>

      <Divider />

      <Box sx={{ px: 2, py: 1.25 }}>
        <AppButton
          component={RouterLink}
          to={APP_ROUTES.customer.notifications}
          fullWidth
          variant="outlined"
          size="small"
          onClick={onClose}
        >
          View all notifications
        </AppButton>
      </Box>
    </Menu>
  );
}
