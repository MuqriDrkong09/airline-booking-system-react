import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';
import { AppBadge, AppButton, AppDialog } from '@/components/common';
import type { AdminUser } from '../types/adminUser';
import {
  getAdminUserActiveLabel,
  getAdminUserDisplayName,
  getAdminUserRoleLabel,
} from '../utils/adminUserActions';

export interface UserDetailsDialogProps {
  open: boolean;
  user: AdminUser | null;
  onClose: () => void;
  onChangeRole?: (user: AdminUser) => void;
  onActivate?: (user: AdminUser) => void;
  onDeactivate?: (user: AdminUser) => void;
}

function DetailItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <Box sx={{ display: 'grid', gap: 0.5 }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" component="div" sx={{ wordBreak: 'break-word' }}>
        {value}
      </Typography>
    </Box>
  );
}

export function UserDetailsDialog({
  open,
  user,
  onClose,
  onChangeRole,
  onActivate,
  onDeactivate,
}: UserDetailsDialogProps) {
  return (
    <AppDialog
      open={open}
      title={user ? getAdminUserDisplayName(user) : 'User details'}
      onClose={onClose}
      maxWidth="sm"
      actions={
        <>
          <AppButton onClick={onClose} color="inherit">
            Close
          </AppButton>
          {user && onChangeRole ? (
            <AppButton variant="outlined" onClick={() => onChangeRole(user)}>
              Change role
            </AppButton>
          ) : null}
          {user && onActivate ? (
            <AppButton variant="contained" onClick={() => onActivate(user)}>
              Activate
            </AppButton>
          ) : null}
          {user && onDeactivate ? (
            <AppButton variant="contained" color="error" onClick={() => onDeactivate(user)}>
              Deactivate
            </AppButton>
          ) : null}
        </>
      }
    >
      {user ? (
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
          }}
        >
          <DetailItem label="Email" value={user.email} />
          <DetailItem
            label="Role"
            value={
              <AppBadge
                label={getAdminUserRoleLabel(user.role)}
                tone={user.role === 'ADMIN' ? 'info' : 'default'}
              />
            }
          />
          <DetailItem
            label="Status"
            value={
              <AppBadge
                label={getAdminUserActiveLabel(user.active)}
                tone={user.active ? 'success' : 'default'}
              />
            }
          />
          <DetailItem
            label="Email verified"
            value={
              <AppBadge
                label={user.emailVerified ? 'Verified' : 'Unverified'}
                tone={user.emailVerified ? 'success' : 'warning'}
              />
            }
          />
          <DetailItem label="Phone" value={user.phone || '—'} />
          <DetailItem label="Nationality" value={user.nationality || '—'} />
          <DetailItem label="Date of birth" value={user.dateOfBirth || '—'} />
          <DetailItem
            label="Created"
            value={user.createdAt.replace('T', ' ').slice(0, 16)}
          />
          <Stack sx={{ gridColumn: '1 / -1' }}>
            <DetailItem label="User ID" value={user.id} />
          </Stack>
        </Box>
      ) : null}
    </AppDialog>
  );
}
