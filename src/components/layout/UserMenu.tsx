import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { LogOut, User } from 'lucide-react';
import { useId, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import type { DemoUser } from '@/constants/demoUser';
import { APP_ROUTES } from '@/constants/routes';

export interface UserMenuProps {
  user: DemoUser;
  profileTo?: string;
  onLogout?: () => void;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function UserMenu({
  user,
  profileTo = APP_ROUTES.customer.profile,
  onLogout,
}: UserMenuProps) {
  const navigate = useNavigate();
  const menuId = useId();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const handleClose = () => setAnchorEl(null);

  const handleLogout = () => {
    handleClose();
    onLogout?.();
    void navigate(APP_ROUTES.public.home);
  };

  return (
    <>
      <IconButton
        color="inherit"
        onClick={(event) => setAnchorEl(event.currentTarget)}
        aria-label="Open user menu"
        aria-controls={open ? menuId : undefined}
        aria-haspopup="menu"
        aria-expanded={open ? 'true' : undefined}
      >
        <Avatar
          sx={{ width: 36, height: 36, bgcolor: 'secondary.main', color: 'secondary.contrastText' }}
        >
          {getInitials(user.name)}
        </Avatar>
      </IconButton>

      <Menu
        id={menuId}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: { sx: { minWidth: 240, mt: 1 } },
          list: { 'aria-label': 'User menu' },
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle2">{user.name}</Typography>
          <Typography variant="body2" color="text.secondary">
            {user.email}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {user.roleLabel}
          </Typography>
        </Box>
        <Divider />
        <MenuItem component={RouterLink} to={profileTo} onClick={handleClose}>
          <ListItemIcon>
            <User aria-hidden="true" size={18} />
          </ListItemIcon>
          <ListItemText>Profile</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogOut aria-hidden="true" size={18} />
          </ListItemIcon>
          <ListItemText>Log out</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}
