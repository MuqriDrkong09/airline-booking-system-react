import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { CircleAlert } from 'lucide-react';
import type { ReactNode } from 'react';
import { AppButton } from './AppButton';

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  action?: ReactNode;
  icon?: ReactNode;
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  retryLabel = 'Try again',
  action,
  icon,
}: ErrorStateProps) {
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
        {title}
      </Typography>
      <Typography color="text.secondary" sx={{ maxWidth: 480 }}>
        {message}
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
