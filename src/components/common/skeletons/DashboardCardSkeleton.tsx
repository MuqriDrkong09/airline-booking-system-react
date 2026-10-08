import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import { AppCard } from '../AppCard';
import { SkeletonBlock } from './SkeletonBlock';

export interface DashboardCardSkeletonProps {
  count?: number;
  columns?: { xs?: number; sm?: number; md?: number; lg?: number };
}

export function DashboardCardSkeleton({
  count = 6,
  columns = { xs: 1, sm: 2, lg: 3 },
}: DashboardCardSkeletonProps) {
  return (
    <SkeletonBlock label="Loading dashboard metrics">
      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: {
            xs: `repeat(${columns.xs ?? 1}, minmax(0, 1fr))`,
            sm: columns.sm ? `repeat(${columns.sm}, minmax(0, 1fr))` : undefined,
            md: columns.md ? `repeat(${columns.md}, minmax(0, 1fr))` : undefined,
            lg: columns.lg ? `repeat(${columns.lg}, minmax(0, 1fr))` : undefined,
          },
        }}
      >
        {Array.from({ length: count }).map((_, index) => (
          <AppCard key={index} sx={{ height: '100%' }}>
            <Stack spacing={1.25}>
              <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
                <Skeleton variant="rounded" width={44} height={44} />
                <Skeleton width="45%" />
              </Stack>
              <Skeleton width="55%" height={32} />
              <Skeleton width="70%" height={16} />
            </Stack>
          </AppCard>
        ))}
      </Box>
    </SkeletonBlock>
  );
}
