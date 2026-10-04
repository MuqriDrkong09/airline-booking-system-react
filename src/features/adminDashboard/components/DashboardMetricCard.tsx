import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { LucideIcon } from 'lucide-react';
import { AppCard } from '@/components/common';

export interface DashboardMetricCardProps {
  label: string;
  value: string;
  helperText?: string;
  icon: LucideIcon;
  tone?: 'default' | 'success' | 'warning' | 'error' | 'info';
}

const TONE_BG: Record<NonNullable<DashboardMetricCardProps['tone']>, string> = {
  default: 'action.hover',
  success: 'success.light',
  warning: 'warning.light',
  error: 'error.light',
  info: 'info.light',
};

export function DashboardMetricCard({
  label,
  value,
  helperText,
  icon: Icon,
  tone = 'default',
}: DashboardMetricCardProps) {
  return (
    <AppCard sx={{ height: '100%' }}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 1.5,
            display: 'grid',
            placeItems: 'center',
            bgcolor: TONE_BG[tone],
            color: tone === 'default' ? 'text.primary' : `${tone}.dark`,
            flexShrink: 0,
          }}
        >
          <Icon aria-hidden="true" size={22} />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
          <Typography variant="h5" component="p" sx={{ fontWeight: 700, mt: 0.25 }}>
            {value}
          </Typography>
          {helperText ? (
            <Typography variant="caption" color="text.secondary">
              {helperText}
            </Typography>
          ) : null}
        </Box>
      </Stack>
    </AppCard>
  );
}
