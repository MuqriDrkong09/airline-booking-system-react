import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { Eye, Shield, UserMinus, UserPlus } from 'lucide-react';
import type { ReactNode } from 'react';
import {
  AppBadge,
  AppButton,
  AppCard,
  AppTable,
  type AppTableColumn,
} from '@/components/common';
import type { AdminUser } from '../types/adminUser';
import {
  canActivateAdminUser,
  canDeactivateAdminUser,
  getAdminUserActiveLabel,
  getAdminUserDisplayName,
  getAdminUserRoleLabel,
  isSelfAdminUser,
} from '../utils/adminUserActions';

export interface UserTableProps {
  users: readonly AdminUser[];
  actorUserId: string | null | undefined;
  activeUpdatingId?: string | null;
  onView: (user: AdminUser) => void;
  onChangeRole: (user: AdminUser) => void;
  onActivate: (user: AdminUser) => void;
  onDeactivate: (user: AdminUser) => void;
}

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
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

function UserMobileCard({
  user,
  actorUserId,
  activeUpdatingId,
  onView,
  onChangeRole,
  onActivate,
  onDeactivate,
}: {
  user: AdminUser;
  actorUserId: string | null | undefined;
  activeUpdatingId?: string | null;
  onView: (user: AdminUser) => void;
  onChangeRole: (user: AdminUser) => void;
  onActivate: (user: AdminUser) => void;
  onDeactivate: (user: AdminUser) => void;
}) {
  const isSelf = isSelfAdminUser(user, actorUserId);
  const busy = activeUpdatingId === user.id;

  return (
    <AppCard
      title={getAdminUserDisplayName(user)}
      subtitle={user.email}
      action={
        <IconButton aria-label={`View ${user.email}`} size="small" onClick={() => onView(user)}>
          <Eye aria-hidden="true" size={16} />
        </IconButton>
      }
    >
      <Box
        sx={{
          display: 'grid',
          gap: 1.5,
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        }}
      >
        <InfoRow
          label="Role"
          value={
            <AppBadge
              label={getAdminUserRoleLabel(user.role)}
              tone={user.role === 'ADMIN' ? 'info' : 'default'}
            />
          }
        />
        <InfoRow
          label="Status"
          value={
            <AppBadge
              label={getAdminUserActiveLabel(user.active)}
              tone={user.active ? 'success' : 'default'}
            />
          }
        />
        <InfoRow
          label="Verified"
          value={user.emailVerified ? 'Yes' : 'No'}
        />
        <InfoRow label="You" value={isSelf ? 'Current account' : '—'} />
        <Box sx={{ gridColumn: '1 / -1', display: 'grid', gap: 1 }}>
          <AppButton size="small" variant="outlined" onClick={() => onChangeRole(user)}>
            Change role
          </AppButton>
          {canActivateAdminUser(user) ? (
            <AppButton
              size="small"
              variant="outlined"
              disabled={busy}
              onClick={() => onActivate(user)}
            >
              Activate
            </AppButton>
          ) : null}
          {canDeactivateAdminUser(user, actorUserId) ? (
            <AppButton
              size="small"
              variant="outlined"
              color="error"
              disabled={busy}
              onClick={() => onDeactivate(user)}
            >
              Deactivate
            </AppButton>
          ) : null}
        </Box>
      </Box>
    </AppCard>
  );
}

export function UserTable({
  users,
  actorUserId,
  activeUpdatingId = null,
  onView,
  onChangeRole,
  onActivate,
  onDeactivate,
}: UserTableProps) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'), { defaultMatches: true });

  const columns: AppTableColumn<AdminUser>[] = [
    {
      id: 'name',
      header: 'Name',
      cell: (user) => (
        <Stack spacing={0.25}>
          <strong>{getAdminUserDisplayName(user)}</strong>
          {isSelfAdminUser(user, actorUserId) ? (
            <Typography variant="caption" color="text.secondary">
              You
            </Typography>
          ) : null}
        </Stack>
      ),
    },
    {
      id: 'email',
      header: 'Email',
      cell: (user) => user.email,
    },
    {
      id: 'role',
      header: 'Role',
      cell: (user) => (
        <AppBadge
          label={getAdminUserRoleLabel(user.role)}
          tone={user.role === 'ADMIN' ? 'info' : 'default'}
        />
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: (user) => (
        <AppBadge
          label={getAdminUserActiveLabel(user.active)}
          tone={user.active ? 'success' : 'default'}
        />
      ),
    },
    {
      id: 'verified',
      header: 'Verified',
      cell: (user) => (
        <AppBadge
          label={user.emailVerified ? 'Verified' : 'Unverified'}
          tone={user.emailVerified ? 'success' : 'warning'}
        />
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      align: 'right',
      cell: (user) => {
        const busy = activeUpdatingId === user.id;
        return (
          <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'flex-end' }}>
            <IconButton
              aria-label={`View ${user.email}`}
              size="small"
              onClick={() => onView(user)}
            >
              <Eye aria-hidden="true" size={16} />
            </IconButton>
            <IconButton
              aria-label={`Change role for ${user.email}`}
              size="small"
              onClick={() => onChangeRole(user)}
            >
              <Shield aria-hidden="true" size={16} />
            </IconButton>
            {canActivateAdminUser(user) ? (
              <IconButton
                aria-label={`Activate ${user.email}`}
                size="small"
                disabled={busy}
                onClick={() => onActivate(user)}
              >
                <UserPlus aria-hidden="true" size={16} />
              </IconButton>
            ) : (
              <IconButton
                aria-label={`Deactivate ${user.email}`}
                size="small"
                color="error"
                disabled={busy || !canDeactivateAdminUser(user, actorUserId)}
                onClick={() => onDeactivate(user)}
              >
                <UserMinus aria-hidden="true" size={16} />
              </IconButton>
            )}
          </Stack>
        );
      },
    },
  ];

  if (users.length === 0) {
    return (
      <Box role="status" sx={{ py: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">No users match your filters.</Typography>
      </Box>
    );
  }

  if (!isDesktop) {
    return (
      <Stack spacing={2} component="section" aria-label="Admin users">
        {users.map((user) => (
          <UserMobileCard
            key={user.id}
            user={user}
            actorUserId={actorUserId}
            activeUpdatingId={activeUpdatingId}
            onView={onView}
            onChangeRole={onChangeRole}
            onActivate={onActivate}
            onDeactivate={onDeactivate}
          />
        ))}
      </Stack>
    );
  }

  return (
    <AppTable
      ariaLabel="Admin users"
      columns={columns}
      rows={users}
      getRowId={(user) => user.id}
      emptyMessage="No users match your filters."
      dense
      stickyHeader
    />
  );
}
