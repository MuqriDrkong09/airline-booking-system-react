import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade';
import IconButton from '@mui/material/IconButton';
import Modal from '@mui/material/Modal';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { X } from 'lucide-react';
import type { ModalProps } from '@mui/material/Modal';
import type { ReactNode } from 'react';

export interface AppModalProps extends Omit<ModalProps, 'children' | 'title'> {
  title: string;
  children: ReactNode;
  onClose: () => void;
  width?: number | string;
  showCloseButton?: boolean;
}

export function AppModal({
  open,
  title,
  children,
  onClose,
  width = 480,
  showCloseButton = true,
  ...props
}: AppModalProps) {
  const titleId = 'app-modal-title';

  return (
    <Modal
      {...props}
      open={open}
      onClose={onClose}
      aria-labelledby={titleId}
      closeAfterTransition
    >
      <Fade in={open}>
        <Paper
          elevation={8}
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: 'calc(100% - 32px)', sm: width },
            maxWidth: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            p: { xs: 2.5, sm: 3 },
            outline: 'none',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 2,
              mb: 2,
            }}
          >
            <Typography id={titleId} variant="h5" component="h2">
              {title}
            </Typography>
            {showCloseButton ? (
              <IconButton aria-label="Close dialog" onClick={onClose} edge="end" size="small">
                <X aria-hidden="true" size={18} />
              </IconButton>
            ) : null}
          </Box>
          {children}
        </Paper>
      </Fade>
    </Modal>
  );
}
