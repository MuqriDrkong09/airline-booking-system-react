import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import type { CardProps } from '@mui/material/Card';
import type { ReactNode } from 'react';

export interface AppCardProps extends Omit<CardProps, 'title'> {
  title?: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  outlined?: boolean;
}

export function AppCard({
  title,
  subtitle,
  action,
  children,
  footer,
  outlined = true,
  variant,
  ...props
}: AppCardProps) {
  return (
    <Card {...props} variant={variant ?? (outlined ? 'outlined' : 'elevation')}>
      {title || subtitle || action ? (
        <CardHeader title={title} subheader={subtitle} action={action} />
      ) : null}
      <CardContent>{children}</CardContent>
      {footer ? <CardActions sx={{ px: 2, pb: 2 }}>{footer}</CardActions> : null}
    </Card>
  );
}
