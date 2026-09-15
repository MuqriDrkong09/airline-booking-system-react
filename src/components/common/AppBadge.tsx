import Chip from '@mui/material/Chip';
import type { ChipProps } from '@mui/material/Chip';

export type AppBadgeTone = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';

export interface AppBadgeProps extends Omit<ChipProps, 'color'> {
  tone?: AppBadgeTone;
}

export function AppBadge({ tone = 'default', size = 'small', ...props }: AppBadgeProps) {
  return <Chip {...props} size={size} color={tone === 'default' ? 'default' : tone} />;
}
