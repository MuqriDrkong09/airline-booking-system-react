import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { LucideIcon } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';
import { AppCard } from '@/components/common';

export interface CustomerHomeStatCardProps {
  label: string;
  value: string;
  helperText: string;
  icon: LucideIcon;
  to: string;
  tone?: 'default' | 'success' | 'warning' | 'error' | 'info';
}

const TONE_BG: Record<NonNullable<CustomerHomeStatCardProps['tone']>, string> = {
  default: 'action.hover',
  success: 'success.light',
  warning: 'warning.light',
  error: 'error.light',
  info: 'info.light',
};

export function CustomerHomeStatCard({
  label,
  value,
  helperText,
  icon: Icon,
  to,
  tone = 'default',
}: CustomerHomeStatCardProps) {
  return (
    <AppCard
      component={RouterLink}
      to={to}
      sx={{
        height: '100%',
        textDecoration: 'none',
        color: 'inherit',
        transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
        '&:hover': {
          borderColor: 'primary.main',
          boxShadow: 2,
        },
      }}
    >
      <Stack spacing={1.25}>
        <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 1.5,
              display: 'grid',
              placeItems: 'center',
              bgcolor: TONE_BG[tone],
              color: tone === 'default' ? 'text.primary' : `${tone}.dark`,
              flexShrink: 0,
            }}
          >
            <Icon aria-hidden="true" size={20} />
          </Box>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
        </Stack>
        <Box>
          <Typography variant="h5" component="p" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
            {value}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
            {helperText}
          </Typography>
        </Box>
      </Stack>
    </AppCard>
  );
}
