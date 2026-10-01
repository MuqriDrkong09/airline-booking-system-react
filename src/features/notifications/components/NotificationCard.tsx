import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Check, Trash2 } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';
import { AppBadge, AppButton, AppCard } from '@/components/common';
import type { AppNotification } from '../types/notification';
import { isNotificationUnread } from '../types/notification';
import {
  formatNotificationTime,
  NOTIFICATION_TYPE_LABELS,
  NOTIFICATION_TYPE_TONES,
} from '../utils/notificationMeta';

export interface NotificationCardProps {
  notification: AppNotification;
  compact?: boolean;
  onMarkAsRead?: (notificationId: string) => void;
  onDelete?: (notificationId: string) => void;
  onNavigate?: () => void;
  markAsReadPending?: boolean;
  deletePending?: boolean;
}

export function NotificationCard({
  notification,
  compact = false,
  onMarkAsRead,
  onDelete,
  onNavigate,
  markAsReadPending = false,
  deletePending = false,
}: NotificationCardProps) {
  const unread = isNotificationUnread(notification);

  return (
    <AppCard
      sx={{
        bgcolor: unread ? 'action.hover' : 'background.paper',
        borderColor: unread ? 'primary.light' : 'divider',
      }}
    >
      <Stack spacing={compact ? 1 : 1.5}>
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}
        >
          <Stack spacing={0.75} sx={{ minWidth: 0, flex: 1 }}>
            <Stack
              direction="row"
              spacing={1}
              useFlexGap
              sx={{ alignItems: 'center', flexWrap: 'wrap' }}
            >              <AppBadge
                label={NOTIFICATION_TYPE_LABELS[notification.type]}
                tone={NOTIFICATION_TYPE_TONES[notification.type]}
                size="small"
                variant="outlined"
              />
              {unread ? <AppBadge label="Unread" tone="primary" size="small" /> : null}
            </Stack>

            <Typography
              variant={compact ? 'subtitle2' : 'h6'}
              component={compact ? 'h3' : 'h2'}
              sx={{ fontWeight: unread ? 700 : 600 }}
            >
              {notification.title}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              {notification.message}
            </Typography>

            <Typography variant="caption" color="text.secondary">
              {formatNotificationTime(notification.createdAt)}
              {notification.bookingReference
                ? ` · ${notification.bookingReference}`
                : null}
            </Typography>
          </Stack>

          <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
            {unread && onMarkAsRead ? (
              <IconButton
                size="small"
                aria-label={`Mark "${notification.title}" as read`}
                onClick={() => onMarkAsRead(notification.id)}
                disabled={markAsReadPending}
              >
                <Check aria-hidden="true" size={16} />
              </IconButton>
            ) : null}
            {onDelete ? (
              <IconButton
                size="small"
                aria-label={`Delete "${notification.title}"`}
                onClick={() => onDelete(notification.id)}
                disabled={deletePending}
              >
                <Trash2 aria-hidden="true" size={16} />
              </IconButton>
            ) : null}
          </Box>
        </Stack>

        {notification.href ? (
          <Box>
            <AppButton
              component={RouterLink}
              to={notification.href}
              size="small"
              variant={compact ? 'text' : 'outlined'}
              onClick={onNavigate}
            >
              View details
            </AppButton>
          </Box>
        ) : null}
      </Stack>
    </AppCard>
  );
}
