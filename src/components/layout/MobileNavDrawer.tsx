import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { X } from 'lucide-react';
import type { NavItem } from '@/constants/nav';
import { SIDEBAR_WIDTH } from '@/constants/routes';
import { SidebarNav } from './SidebarNav';

export interface MobileNavDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  items: readonly NavItem[];
  ariaLabel: string;
}

export function MobileNavDrawer({
  open,
  onClose,
  title,
  items,
  ariaLabel,
}: MobileNavDrawerProps) {
  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      slotProps={{
        paper: { sx: { width: SIDEBAR_WIDTH } },
      }}
    >
      <Box id="mobile-navigation" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            py: 1.5,
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Typography variant="subtitle1" component="p" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
          <IconButton aria-label="Close navigation menu" onClick={onClose}>
            <X aria-hidden="true" size={18} />
          </IconButton>
        </Box>
        <Box sx={{ py: 1, overflow: 'auto' }}>
          <SidebarNav items={items} ariaLabel={ariaLabel} onNavigate={onClose} />
        </Box>
      </Box>
    </Drawer>
  );
}
