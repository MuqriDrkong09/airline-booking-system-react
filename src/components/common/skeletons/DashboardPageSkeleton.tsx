import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import { ChartSkeleton } from './ChartSkeleton';
import { DashboardCardSkeleton } from './DashboardCardSkeleton';
import { SkeletonBlock } from './SkeletonBlock';

/** Full admin dashboard placeholder: metrics + chart grid. */
export function DashboardPageSkeleton() {
  return (
    <SkeletonBlock label="Loading dashboard">
      <Stack spacing={3}>
        <Skeleton width={220} />
        <DashboardCardSkeleton count={6} columns={{ xs: 1, sm: 2, lg: 3 }} />
        <ChartSkeleton count={4} columns={{ xs: 1, lg: 2 }} />
        <ChartSkeleton count={1} columns={{ xs: 1, lg: 1 }} />
      </Stack>
    </SkeletonBlock>
  );
}
