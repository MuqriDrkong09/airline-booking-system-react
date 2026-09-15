import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { Menu, Plane } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { ThemeModeToggle } from '@/components/common/ThemeModeToggle';
import type { DemoUser } from '@/constants/demoUser';
import { UserMenu } from './UserMenu';

export interface DashboardHeaderProps {
  appName: string;
  sectionLabel: string;
  homeTo: string;
  user: DemoUser;
  profileTo: string;
  onOpenMobileNav: () => void;
  isMobileNavOpen: boolean;
}

export function DashboardHeader({
  appName,
  sectionLabel,
  homeTo,
  user,
  profileTo,
  onOpenMobileNav,
  isMobileNavOpen,
}: DashboardHeaderProps) {
  return (
    <AppBar
      position="sticky"
      color="default"
      component="header"
      sx={{
        borderBottom: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        color: 'text.primary',
      }}
    >
      <Toolbar sx={{ gap: 1, minHeight: { xs: 64, md: 72 } }}>
        <IconButton
          color="inherit"
          aria-label="Open navigation menu"
          aria-controls="mobile-navigation"
          aria-expanded={isMobileNavOpen}
          onClick={onOpenMobileNav}
          sx={{ display: { xs: 'inline-flex', md: 'none' } }}
        >
          <Menu aria-hidden="true" />
        </IconButton>

        <Box
          component={NavLink}
          to={homeTo}
          end
          aria-label={`${appName} ${sectionLabel} home`}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            color: 'inherit',
            textDecoration: 'none',
          }}
        >
          <Plane aria-hidden="true" size={20} />
          <Box sx={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
            <Typography variant="subtitle1" component="span" sx={{ fontWeight: 700 }}>
              {appName}
            </Typography>
            <Typography variant="caption" color="text.secondary" component="span">
              {sectionLabel}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        <ThemeModeToggle />
        <UserMenu user={user} profileTo={profileTo} />
      </Toolbar>
    </AppBar>
  );
}
