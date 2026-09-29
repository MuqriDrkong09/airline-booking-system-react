import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';
import { AppCard } from '@/components/common';

export interface BookingDetailSectionProps {
  title: string;
  subtitle?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  empty?: boolean;
  emptyMessage?: string;
  id?: string;
}

export function BookingDetailSection({
  title,
  subtitle,
  action,
  children,
  empty = false,
  emptyMessage = 'Nothing to show.',
  id,
}: BookingDetailSectionProps) {
  return (
    <AppCard id={id} title={title} subtitle={subtitle} action={action}>
      {empty ? (
        <Typography variant="body2" color="text.secondary">
          {emptyMessage}
        </Typography>
      ) : (
        children
      )}
    </AppCard>
  );
}
