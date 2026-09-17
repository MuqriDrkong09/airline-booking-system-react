import { AppBar, Box, Button, IconButton, Toolbar, Typography } from '@mui/material';
import { LogIn, Menu, Plane, User, UserPlus } from 'lucide-react';
import { useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { useUiStore } from '@/app/store/uiStore';
import { ThemeModeToggle } from '@/components/common/ThemeModeToggle';
import { PUBLIC_NAV_ITEMS, type NavItem } from '@/constants/nav';
import { APP_ROUTES } from '@/constants/routes';
import { getPostLoginRedirect, useAuth } from '@/features/auth';
import { UserRole } from '@/types/auth';
import { MobileNavDrawer } from './MobileNavDrawer';

interface PublicHeaderProps {
  appName: string;
}

export function PublicHeader({ appName }: PublicHeaderProps) {
  const isMobileNavOpen = useUiStore((state) => state.isMobileNavOpen);
  const openMobileNav = useUiStore((state) => state.openMobileNav);
  const closeMobileNav = useUiStore((state) => state.closeMobileNav);
  const { isAuthenticated, user } = useAuth();

  const accountTo = user ? getPostLoginRedirect(user.role) : APP_ROUTES.public.login;
  const isAdmin = user?.role === UserRole.ADMIN;

  const mobileNavItems = useMemo((): readonly NavItem[] => {
    if (isAuthenticated && user) {
      return [
        ...PUBLIC_NAV_ITEMS,
        {
          label: isAdmin ? 'Admin dashboard' : 'My account',
          to: accountTo,
          icon: User,
        },
      ] as const;
    }

    return [
      ...PUBLIC_NAV_ITEMS,
      { label: 'Sign in', to: APP_ROUTES.public.login, icon: LogIn },
      { label: 'Create account', to: APP_ROUTES.public.register, icon: UserPlus },
    ] as const;
  }, [accountTo, isAdmin, isAuthenticated, user]);

  return (
    <>
      <AppBar position="sticky" color="primary" component="header">
        <Toolbar sx={{ gap: 1, minHeight: { xs: 64, md: 72 } }}>
          <IconButton
            color="inherit"
            aria-label="Open navigation menu"
            aria-controls="mobile-navigation"
            aria-expanded={isMobileNavOpen}
            onClick={openMobileNav}
            sx={{ display: { xs: 'inline-flex', md: 'none' } }}
          >
            <Menu aria-hidden="true" />
          </IconButton>

          <Box
            component={NavLink}
            to={APP_ROUTES.public.home}
            end
            aria-label={`${appName} home`}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              color: 'inherit',
              textDecoration: 'none',
              mr: { md: 3 },
            }}
          >
            <Plane aria-hidden="true" size={22} />
            <Typography variant="h6" component="span" sx={{ fontWeight: 700 }}>
              {appName}
            </Typography>
          </Box>

          <Box
            component="nav"
            aria-label="Primary"
            sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 0.5 }}
          >
            {PUBLIC_NAV_ITEMS.map((item) => (
              <Button
                key={item.to}
                component={NavLink}
                to={item.to}
                end={item.end}
                color="inherit"
                sx={{
                  '&.active': {
                    fontWeight: 700,
                    bgcolor: 'rgba(255, 255, 255, 0.12)',
                  },
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          <ThemeModeToggle />

          {isAuthenticated && user ? (
            <Button
              component={NavLink}
              to={accountTo}
              color="secondary"
              variant="contained"
            >
              {isAdmin ? 'Admin dashboard' : 'My account'}
            </Button>
          ) : (
            <>
              <Button
                component={NavLink}
                to={APP_ROUTES.public.login}
                color="inherit"
                variant="outlined"
                sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
              >
                Sign in
              </Button>
              <Button
                component={NavLink}
                to={APP_ROUTES.public.register}
                color="secondary"
                variant="contained"
              >
                Create account
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>

      <MobileNavDrawer
        open={isMobileNavOpen}
        onClose={closeMobileNav}
        title="Menu"
        items={mobileNavItems}
        ariaLabel="Mobile"
      />
    </>
  );
}
