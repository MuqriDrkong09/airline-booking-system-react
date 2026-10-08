import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import type { DialogProps } from '@mui/material/Dialog';
import { X } from 'lucide-react';
import { useId, type ReactNode } from 'react';

export interface AppDialogProps extends Omit<DialogProps, 'title'> {
  title: string;
  children: ReactNode;
  actions?: ReactNode;
  onClose: () => void;
  /** Show a top-right close control. Defaults to true when no actions are provided. */
  showCloseButton?: boolean;
}

export function AppDialog({
  title,
  children,
  actions,
  onClose,
  fullWidth = true,
  maxWidth = 'sm',
  transitionDuration,
  showCloseButton,
  ...props
}: AppDialogProps) {
  const titleId = useId();
  const contentId = useId();
  // Avoid flaky close assertions under load; production keeps MUI defaults.
  const resolvedTransitionDuration =
    transitionDuration ?? (process.env.NODE_ENV === 'test' ? 0 : undefined);
  const resolvedShowClose =
    showCloseButton ?? (actions === undefined || actions === null);

  return (
    <Dialog
      {...props}
      onClose={onClose}
      fullWidth={fullWidth}
      maxWidth={maxWidth}
      transitionDuration={resolvedTransitionDuration}
      aria-labelledby={titleId}
      aria-describedby={contentId}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 1,
          pr: resolvedShowClose ? 1 : 0,
        }}
      >
        <DialogTitle id={titleId} sx={{ flex: 1, pr: resolvedShowClose ? 1 : undefined }}>
          {title}
        </DialogTitle>
        {resolvedShowClose ? (
          <IconButton
            aria-label="Close dialog"
            onClick={onClose}
            edge="end"
            size="small"
            sx={{ mt: 1.5, mr: 1 }}
          >
            <X aria-hidden="true" size={18} />
          </IconButton>
        ) : null}
      </Box>
      <DialogContent dividers id={contentId}>
        {children}
      </DialogContent>
      {actions ? <DialogActions sx={{ px: 3, py: 2 }}>{actions}</DialogActions> : null}
    </Dialog>
  );
}
