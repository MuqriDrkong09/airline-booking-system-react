import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import {
  AppAlert,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  PageLoader,
} from '@/components/common';
import { useAuth } from '@/features/auth';
import type { UserRole } from '@/types/auth';
import {
  useAdminUsersQuery,
  useChangeAdminUserRoleMutation,
  useSetAdminUserActiveMutation,
} from '../hooks/useAdminUsers';
import {
  EMPTY_ADMIN_USER_FILTERS,
  type AdminUser,
  type AdminUserFilters,
} from '../types/adminUser';
import {
  canActivateAdminUser,
  canDeactivateAdminUser,
  getAdminUserDisplayName,
  getAdminUserRoleLabel,
  isSelfAdminUser,
} from '../utils/adminUserActions';
import { ChangeRoleDialog } from './ChangeRoleDialog';
import { UserDetailsDialog } from './UserDetailsDialog';
import { UserFilters } from './UserFilters';
import { UserTable } from './UserTable';

type DialogState =
  | { mode: 'closed' }
  | { mode: 'view'; user: AdminUser }
  | { mode: 'changeRole'; user: AdminUser };

export function AdminUsersView() {
  const { user: actor } = useAuth();
  const actorUserId = actor?.id;
  const [filters, setFilters] = useState<AdminUserFilters>(EMPTY_ADMIN_USER_FILTERS);
  const [dialog, setDialog] = useState<DialogState>({ mode: 'closed' });
  const [deactivateTarget, setDeactivateTarget] = useState<AdminUser | null>(null);
  const [activateTarget, setActivateTarget] = useState<AdminUser | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const listQuery = useAdminUsersQuery(filters);
  const activeMutation = useSetAdminUserActiveMutation();
  const roleMutation = useChangeAdminUserRoleMutation();

  if (listQuery.isLoading) {
    return <PageLoader label="Loading users" />;
  }

  if (listQuery.isError) {
    return (
      <ErrorState
        title="Unable to load users"
        message="Please try again in a moment."
        onRetry={() => {
          void listQuery.refetch();
        }}
      />
    );
  }

  const users = listQuery.data ?? [];

  const requireActor = () => {
    if (!actorUserId) {
      throw new Error('You must be signed in to manage users.');
    }
    return actorUserId;
  };

  const handleActivateConfirm = async () => {
    if (!activateTarget) {
      return;
    }
    setActionError(null);
    try {
      const updated = await activeMutation.mutateAsync({
        userId: activateTarget.id,
        active: true,
        actorUserId: requireActor(),
      });
      setActionSuccess(`Activated ${getAdminUserDisplayName(updated)}.`);
      setActivateTarget(null);
      setDialog({ mode: 'closed' });
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Unable to activate user.');
    }
  };

  const handleDeactivateConfirm = async () => {
    if (!deactivateTarget) {
      return;
    }
    setActionError(null);
    try {
      const updated = await activeMutation.mutateAsync({
        userId: deactivateTarget.id,
        active: false,
        actorUserId: requireActor(),
      });
      setActionSuccess(`Deactivated ${getAdminUserDisplayName(updated)}.`);
      setDeactivateTarget(null);
      setDialog({ mode: 'closed' });
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Unable to deactivate user.');
    }
  };

  const handleChangeRole = async (role: UserRole) => {
    if (dialog.mode !== 'changeRole') {
      return;
    }
    setActionError(null);
    const updated = await roleMutation.mutateAsync({
      userId: dialog.user.id,
      role,
      actorUserId: requireActor(),
    });
    setActionSuccess(
      `Updated ${getAdminUserDisplayName(updated)} to ${getAdminUserRoleLabel(updated.role)}.`,
    );
    setDialog({ mode: 'closed' });
  };

  return (
    <Stack spacing={3}>
      <Typography variant="body2" color="text.secondary">
        {users.length} user{users.length === 1 ? '' : 's'}
      </Typography>

      <UserFilters value={filters} onChange={setFilters} />

      {actionError ? (
        <AppAlert severity="error" onClose={() => setActionError(null)}>
          {actionError}
        </AppAlert>
      ) : null}
      {actionSuccess ? (
        <AppAlert severity="success" onClose={() => setActionSuccess(null)}>
          {actionSuccess}
        </AppAlert>
      ) : null}

      {users.length === 0 && !filters.search && !filters.role && !filters.active ? (
        <EmptyState
          title="No users yet"
          message="Users will appear here once accounts are created."
        />
      ) : (
        <UserTable
          users={users}
          actorUserId={actorUserId}
          activeUpdatingId={
            activeMutation.isPending ? activeMutation.variables?.userId : null
          }
          onView={(user) => {
            setActionError(null);
            setDialog({ mode: 'view', user });
          }}
          onChangeRole={(user) => {
            setActionError(null);
            setDialog({ mode: 'changeRole', user });
          }}
          onActivate={(user) => {
            setActionError(null);
            setActivateTarget(user);
          }}
          onDeactivate={(user) => {
            setActionError(null);
            setDeactivateTarget(user);
          }}
        />
      )}

      <UserDetailsDialog
        open={dialog.mode === 'view'}
        user={dialog.mode === 'view' ? dialog.user : null}
        onClose={() => setDialog({ mode: 'closed' })}
        onChangeRole={
          dialog.mode === 'view'
            ? (user) => setDialog({ mode: 'changeRole', user })
            : undefined
        }
        onActivate={
          dialog.mode === 'view' && canActivateAdminUser(dialog.user)
            ? (user) => setActivateTarget(user)
            : undefined
        }
        onDeactivate={
          dialog.mode === 'view' && canDeactivateAdminUser(dialog.user, actorUserId)
            ? (user) => setDeactivateTarget(user)
            : undefined
        }
      />

      <ChangeRoleDialog
        open={dialog.mode === 'changeRole'}
        user={dialog.mode === 'changeRole' ? dialog.user : null}
        actorUserId={actorUserId}
        submitting={roleMutation.isPending}
        onClose={() => setDialog({ mode: 'closed' })}
        onConfirm={handleChangeRole}
      />

      <ConfirmDialog
        open={Boolean(activateTarget)}
        title="Activate user"
        description={
          activateTarget
            ? `Activate ${getAdminUserDisplayName(activateTarget)} (${activateTarget.email})? They will regain access to the application.`
            : ''
        }
        confirmLabel="Activate"
        loading={activeMutation.isPending}
        onCancel={() => setActivateTarget(null)}
        onConfirm={() => {
          void handleActivateConfirm();
        }}
      />

      <ConfirmDialog
        open={Boolean(deactivateTarget)}
        title="Deactivate user"
        description={
          deactivateTarget
            ? isSelfAdminUser(deactivateTarget, actorUserId)
              ? 'You cannot deactivate your own account.'
              : `Deactivate ${getAdminUserDisplayName(deactivateTarget)} (${deactivateTarget.email})? They will lose access until reactivated.`
            : ''
        }
        confirmLabel="Deactivate"
        confirmColor="error"
        loading={activeMutation.isPending}
        onCancel={() => setDeactivateTarget(null)}
        onConfirm={() => {
          void handleDeactivateConfirm();
        }}
      />
    </Stack>
  );
}
