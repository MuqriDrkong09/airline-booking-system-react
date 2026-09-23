import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { AppButton, AppCard } from '@/components/common';

export interface SummarySectionProps {
  title: string;
  subtitle?: string;
  editTo?: string;
  editLabel?: string;
  children: ReactNode;
  empty?: boolean;
  emptyMessage?: string;
}

export function SummarySection({
  title,
  subtitle,
  editTo,
  editLabel = 'Edit',
  children,
  empty = false,
  emptyMessage = 'Nothing selected yet.',
}: SummarySectionProps) {
  return (
    <AppCard
      title={title}
      subtitle={subtitle}
      action={
        editTo ? (
          <AppButton component={RouterLink} to={editTo} size="small" variant="outlined">
            {editLabel}
          </AppButton>
        ) : undefined
      }
    >
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
