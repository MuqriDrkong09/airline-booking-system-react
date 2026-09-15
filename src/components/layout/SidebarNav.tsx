import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { NavLink } from 'react-router-dom';
import type { NavItem } from '@/constants/nav';

export interface SidebarNavProps {
  items: readonly NavItem[];
  ariaLabel: string;
  onNavigate?: () => void;
  dense?: boolean;
}

export function SidebarNav({ items, ariaLabel, onNavigate, dense = false }: SidebarNavProps) {
  return (
    <List component="nav" aria-label={ariaLabel} dense={dense} sx={{ px: 1 }}>
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <ListItem key={item.to} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              component={NavLink}
              to={item.to}
              end={item.end}
              onClick={onNavigate}
              sx={{
                borderRadius: 2,
                '&.active': {
                  bgcolor: 'action.selected',
                  color: 'primary.main',
                  '& .MuiListItemIcon-root': {
                    color: 'primary.main',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Icon aria-hidden="true" size={20} />
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        );
      })}
    </List>
  );
}
