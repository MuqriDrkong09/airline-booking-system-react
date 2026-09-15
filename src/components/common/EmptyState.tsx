import { Box, Typography } from '@mui/material';
import { Inbox } from 'lucide-react';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  message: string;
  action?: ReactNode;
}

export function EmptyState({ title, message, action }: EmptyStateProps) {
  return (
    <Box
      role="status"
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
      <Inbox aria-hidden="true" size={40} />
      <Typography variant="h5" component="h1">
        {title}
      </Typography>
      <Typography color="text.secondary" sx={{ maxWidth: 480 }}>
        {message}
      </Typography>
      {action}
    </Box>
  );
}
