import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Inbox } from 'lucide-react';
import type { ReactNode } from 'react';

export interface EmptyStateProps {
  title: string;
  message: string;
  action?: ReactNode;
  icon?: ReactNode;
}

export function EmptyState({ title, message, action, icon }: EmptyStateProps) {
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
      {icon ?? <Inbox aria-hidden="true" size={40} />}
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
