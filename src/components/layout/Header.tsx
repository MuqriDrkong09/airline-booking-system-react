import {
  AppBar,
  Box,
  Button,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material';
import { Menu, Plane, X } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useUiStore } from '@/app/store/uiStore';
import { PRIMARY_NAV_ITEMS } from '@/constants/nav';
import { APP_ROUTES } from '@/constants/routes';

interface HeaderProps {
  appName: string;
}

export function Header({ appName }: HeaderProps) {
  const isMobileNavOpen = useUiStore((state) => state.isMobileNavOpen);
  const openMobileNav = useUiStore((state) => state.openMobileNav);
  const closeMobileNav = useUiStore((state) => state.closeMobileNav);

  return (
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
          to={APP_ROUTES.home}
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
          {PRIMARY_NAV_ITEMS.map((item) => (
            <Button
              key={item.to}
              component={NavLink}
              to={item.to}
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

        <Button component={NavLink} to={APP_ROUTES.profile} color="inherit" variant="outlined">
          Sign in
        </Button>
      </Toolbar>

      <Drawer
        anchor="left"
        open={isMobileNavOpen}
        onClose={closeMobileNav}
        slotProps={{
          paper: { sx: { width: 280 } },
        }}
      >
        <Box id="mobile-navigation" component="nav" aria-label="Mobile" sx={{ height: '100%' }}>
          <Box
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2 }}
          >
            <Typography variant="subtitle1" component="p" sx={{ fontWeight: 700 }}>
              Menu
            </Typography>
            <IconButton aria-label="Close navigation menu" onClick={closeMobileNav}>
              <X aria-hidden="true" />
            </IconButton>
          </Box>
          <List>
            {PRIMARY_NAV_ITEMS.map((item) => (
              <ListItem key={item.to} disablePadding>
                <ListItemButton component={NavLink} to={item.to} onClick={closeMobileNav}>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </AppBar>
  );
}
