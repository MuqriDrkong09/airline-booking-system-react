import { Box, Button, Typography } from '@mui/material';
import { CircleAlert } from 'lucide-react';
import type { ReactNode } from 'react';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  action?: ReactNode;
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  retryLabel = 'Try again',
  action,
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
      <CircleAlert aria-hidden="true" size={40} />
      <Typography variant="h5" component="h1">
        {title}
      </Typography>
      <Typography color="text.secondary" sx={{ maxWidth: 480 }}>
        {message}
      </Typography>
      {onRetry ? (
        <Button variant="contained" onClick={onRetry} sx={{ mt: 1 }}>
          {retryLabel}
        </Button>
      ) : null}
      {action}
    </Box>
  );
}
