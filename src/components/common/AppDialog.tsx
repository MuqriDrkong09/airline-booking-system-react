import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import type { DialogProps } from '@mui/material/Dialog';
import type { ReactNode } from 'react';

export interface AppDialogProps extends Omit<DialogProps, 'title'> {
  title: string;
  children: ReactNode;
  actions?: ReactNode;
  onClose: () => void;
}

export function AppDialog({
  title,
  children,
  actions,
  onClose,
  fullWidth = true,
  maxWidth = 'sm',
  transitionDuration,
  ...props
}: AppDialogProps) {
  const titleId = 'app-dialog-title';
  // Avoid flaky close assertions under load; production keeps MUI defaults.
  const resolvedTransitionDuration =
    transitionDuration ?? (process.env.NODE_ENV === 'test' ? 0 : undefined);

  return (
    <Dialog
      {...props}
      onClose={onClose}
      fullWidth={fullWidth}
      maxWidth={maxWidth}
      transitionDuration={resolvedTransitionDuration}
      aria-labelledby={titleId}
    >
      <DialogTitle id={titleId}>{title}</DialogTitle>
      <DialogContent dividers>{children}</DialogContent>
      {actions ? <DialogActions sx={{ px: 3, py: 2 }}>{actions}</DialogActions> : null}
    </Dialog>
  );
}
