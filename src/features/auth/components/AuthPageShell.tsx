import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { AppCard, PageContainer } from '@/components/common';

interface AuthPageShellProps {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthPageShell({ title, description, children, footer }: AuthPageShellProps) {
  return (
    <PageContainer maxWidth="sm">
      <Box sx={{ maxWidth: 480, mx: 'auto', width: '100%' }}>
        <AppCard
          title={
            <Typography variant="h4" component="h1">
              {title}
            </Typography>
          }
          subtitle={description}
        >
          <Stack spacing={2.5}>
            {children}
            {footer}
          </Stack>
        </AppCard>
      </Box>
    </PageContainer>
  );
}

interface AuthTextLinkProps {
  to: string;
  children: ReactNode;
}

export function AuthTextLink({ to, children }: AuthTextLinkProps) {
  return (
    <Link component={RouterLink} to={to} underline="hover">
      {children}
    </Link>
  );
}
