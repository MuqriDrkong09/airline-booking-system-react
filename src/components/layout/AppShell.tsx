import Box from '@mui/material/Box';
import { Outlet } from 'react-router-dom';
import { Footer } from './Footer';
import { Header } from './Header';
import { SkipLink } from './SkipLink';

interface AppShellProps {
  appName: string;
}

export function AppShell({ appName }: AppShellProps) {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <SkipLink />
      <Header appName={appName} />
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
