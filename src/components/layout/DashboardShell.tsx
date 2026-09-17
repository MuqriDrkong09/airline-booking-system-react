import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Typography from '@mui/material/Typography';
import { Outlet } from 'react-router-dom';
import { useUiStore } from '@/app/store/uiStore';
import type { DemoUser } from '@/constants/demoUser';
import type { NavItem } from '@/constants/nav';
import { SIDEBAR_WIDTH } from '@/constants/routes';
import { AppBreadcrumbs } from './AppBreadcrumbs';
import { DashboardHeader } from './DashboardHeader';
import { MobileNavDrawer } from './MobileNavDrawer';
import { SidebarNav } from './SidebarNav';
import { SkipLink } from './SkipLink';

export interface DashboardShellProps {
  appName: string;
  sectionLabel: string;
  homeTo: string;
  profileTo: string;
  navItems: readonly NavItem[];
  navAriaLabel: string;
  user: DemoUser;
  onLogout?: () => void;
}

export function DashboardShell({
  appName,
  sectionLabel,
  homeTo,
  profileTo,
  navItems,
  navAriaLabel,
  user,
  onLogout,
}: DashboardShellProps) {
  const isMobileNavOpen = useUiStore((state) => state.isMobileNavOpen);
  const openMobileNav = useUiStore((state) => state.openMobileNav);
  const closeMobileNav = useUiStore((state) => state.closeMobileNav);

  const sidebar = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ px: 2.5, py: 2.5, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="overline" color="text.secondary">
          Navigation
        </Typography>
        <Typography variant="h6" component="p" sx={{ fontWeight: 700 }}>
          {sectionLabel}
        </Typography>
      </Box>
      <Box sx={{ py: 1, overflow: 'auto', flex: 1 }}>
        <SidebarNav items={navItems} ariaLabel={navAriaLabel} onNavigate={closeMobileNav} />
      </Box>
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: 'background.default' }}>
      <SkipLink />

      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: 'none', md: 'block' },
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: SIDEBAR_WIDTH,
            boxSizing: 'border-box',
            borderRight: 1,
            borderColor: 'divider',
          },
        }}
      >
        {sidebar}
      </Drawer>

      <MobileNavDrawer
        open={isMobileNavOpen}
        onClose={closeMobileNav}
        title={sectionLabel}
        items={navItems}
        ariaLabel={`${navAriaLabel} mobile`}
      />

      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <DashboardHeader
          appName={appName}
          sectionLabel={sectionLabel}
          homeTo={homeTo}
          user={user}
          profileTo={profileTo}
          onOpenMobileNav={openMobileNav}
          isMobileNavOpen={isMobileNavOpen}
          onLogout={onLogout}
        />

        <Box
          component="main"
          id="main-content"
          tabIndex={-1}
          sx={{
            flex: 1,
            outline: 'none',
            px: { xs: 2, md: 3 },
            py: { xs: 2.5, md: 3 },
          }}
        >
          <AppBreadcrumbs />
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
