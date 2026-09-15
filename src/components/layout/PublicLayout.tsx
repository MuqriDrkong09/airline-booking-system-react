import Box from '@mui/material/Box';
import { Outlet } from 'react-router-dom';
import { Footer } from './Footer';
import { PublicHeader } from './PublicHeader';
import { SkipLink } from './SkipLink';

export interface PublicLayoutProps {
  appName: string;
}

export function PublicLayout({ appName }: PublicLayoutProps) {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <SkipLink />
      <PublicHeader appName={appName} />
      <Box
        component="main"
        id="main-content"
        tabIndex={-1}
        sx={{ flex: 1, outline: 'none', py: { xs: 3, md: 5 } }}
      >
        <Outlet />
      </Box>
      <Footer appName={appName} />
    </Box>
  );
}
