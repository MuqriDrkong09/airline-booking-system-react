import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import type { AlertProps } from '@mui/material/Alert';
import type { ReactNode } from 'react';

export interface AppAlertProps extends Omit<AlertProps, 'title'> {
  title?: ReactNode;
  children: ReactNode;
}

export function AppAlert({ title, children, severity = 'info', variant = 'standard', ...props }: AppAlertProps) {
  return (
    <Alert {...props} severity={severity} variant={variant} role="alert">
      {title ? <AlertTitle>{title}</AlertTitle> : null}
      {children}
    </Alert>
  );
}
