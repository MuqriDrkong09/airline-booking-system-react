import Box from '@mui/material/Box';
import { Outlet } from 'react-router-dom';
import {
  LAYOUT_CONTENT_MAX_WIDTH,
  LAYOUT_PAGE_GUTTER_X,
  LAYOUT_PAGE_GUTTER_Y,
} from '@/constants/layout';
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
        sx={{
          flex: 1,
          outline: 'none',
          px: LAYOUT_PAGE_GUTTER_X,
          py: { xs: LAYOUT_PAGE_GUTTER_Y.xs + 0.5, md: 5 },
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: LAYOUT_CONTENT_MAX_WIDTH,
            mx: 'auto',
          }}
        >
          <Outlet />
        </Box>
      </Box>
      <Footer appName={appName} />
    </Box>
  );
}
