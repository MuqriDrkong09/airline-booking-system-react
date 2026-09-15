import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';
import { AppButton } from './AppButton';
import { AppDialog } from './AppDialog';

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmColor?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmColor = 'primary',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <AppDialog
      open={open}
      title={title}
      onClose={onCancel}
      maxWidth="xs"
      actions={
        <>
          <AppButton onClick={onCancel} disabled={loading} color="inherit">
            {cancelLabel}
          </AppButton>
          <AppButton
            onClick={onConfirm}
            variant="contained"
            color={confirmColor}
            loading={loading}
            loadingLabel="Working..."
            autoFocus
          >
            {confirmLabel}
          </AppButton>
        </>
      }
    >
      {typeof description === 'string' ? (
        <Typography color="text.secondary">{description}</Typography>
      ) : (
        description
      )}
    </AppDialog>
  );
}
