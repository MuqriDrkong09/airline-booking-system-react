import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { CircleAlert } from 'lucide-react';
import type { ReactNode } from 'react';
import {
  DEFAULT_ERROR_MESSAGE,
  getErrorMessage,
  getErrorTitle,
} from '@/services/api';
import { AppButton } from './AppButton';

export interface ErrorStateProps {
  title?: string;
  /** Prefer passing `error` so messages stay consistent and sanitized. */
  message?: string;
  error?: unknown;
  onRetry?: () => void;
  retryLabel?: string;
  action?: ReactNode;
  icon?: ReactNode;
}

export function ErrorState({
  title,
  message,
  error,
  onRetry,
  retryLabel = 'Try again',
  action,
  icon,
}: ErrorStateProps) {
  const resolvedTitle = title ?? (error !== undefined ? getErrorTitle(error) : 'Something went wrong');
  const resolvedMessage =
    message ??
    (error !== undefined ? getErrorMessage(error) : DEFAULT_ERROR_MESSAGE);

  return (
    <Box
      role="alert"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: 1.5,
        py: { xs: 6, md: 8 },
        px: 2,
      }}
    >
      {icon ?? <CircleAlert aria-hidden="true" size={40} />}
      <Typography variant="h5" component="h1">
        {resolvedTitle}
      </Typography>
      <Typography color="text.secondary" sx={{ maxWidth: 480 }}>
        {resolvedMessage}
      </Typography>
      {onRetry ? (
        <AppButton variant="contained" onClick={onRetry} sx={{ mt: 1 }}>
          {retryLabel}
        </AppButton>
      ) : null}
      {action}
    </Box>
  );
}
