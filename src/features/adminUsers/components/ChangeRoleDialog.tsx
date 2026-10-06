import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { AppAlert, AppButton, AppDialog, AppSelect } from '@/components/common';
import type { UserRole } from '@/types/auth';
import { ROLE_SELECT_OPTIONS } from '../constants/options';
import type { AdminUser } from '../types/adminUser';
import {
  canChangeAdminUserRole,
  getAdminUserDisplayName,
  getAdminUserRoleLabel,
} from '../utils/adminUserActions';

export interface ChangeRoleDialogProps {
  open: boolean;
  user: AdminUser | null;
  actorUserId: string | null | undefined;
  submitting?: boolean;
  onClose: () => void;
  onConfirm: (role: UserRole) => void | Promise<void>;
}

export function ChangeRoleDialog({
  open,
  user,
  actorUserId,
  submitting = false,
  onClose,
  onConfirm,
}: ChangeRoleDialogProps) {
  const [role, setRole] = useState<UserRole>('USER');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && user) {
      setRole(user.role);
      setError(null);
    }
  }, [open, user]);

  const canSubmit = user ? canChangeAdminUserRole(user, role, actorUserId) : false;
  const selfLock =
    user &&
    actorUserId === user.id &&
    user.role === 'ADMIN' &&
    role !== 'ADMIN';

  const handleConfirm = async () => {
    if (!user) {
      return;
    }
    setError(null);
    try {
      await onConfirm(role);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Unable to change this user role.',
      );
    }
  };

  return (
    <AppDialog
      open={open}
      title={user ? `Change role · ${getAdminUserDisplayName(user)}` : 'Change role'}
      onClose={onClose}
      maxWidth="xs"
      actions={
        <>
          <AppButton onClick={onClose} color="inherit" disabled={submitting}>
            Cancel
          </AppButton>
          <AppButton
            variant="contained"
            color="warning"
            loading={submitting}
            disabled={!canSubmit}
            onClick={() => void handleConfirm()}
          >
            Change role
          </AppButton>
        </>
      }
    >
      <Stack spacing={2}>
        <Typography variant="body2" color="text.secondary">
          {user
            ? `Current role: ${getAdminUserRoleLabel(user.role)}. Changing an administrator to a customer removes admin console access.`
            : null}
        </Typography>
        {selfLock ? (
          <AppAlert severity="warning">
            You cannot remove your own administrator access.
          </AppAlert>
        ) : null}
        {error ? (
          <AppAlert severity="error" onClose={() => setError(null)}>
            {error}
          </AppAlert>
        ) : null}
        <AppSelect
          label="Role"
          options={ROLE_SELECT_OPTIONS}
          value={role}
          onChange={(next) => setRole(next as UserRole)}
        />
      </Stack>
    </AppDialog>
  );
}
