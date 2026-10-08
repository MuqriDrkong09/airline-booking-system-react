import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import { AppCard } from '../AppCard';
import { SkeletonBlock } from './SkeletonBlock';

export interface FlightCardSkeletonProps {
  count?: number;
  /** Match favourites / multi-column flight grids. */
  columns?: { xs?: number; sm?: number; lg?: number };
}

function FlightCardPlaceholder() {
  return (
    <AppCard
      outlined
      sx={{
        height: '100%',
        '& .MuiCardContent-root': {
          p: 2,
          '&:last-child': { pb: 2 },
        },
      }}
    >
      <Stack spacing={1.75}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Skeleton variant="circular" width={44} height={44} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Skeleton width="40%" />
            <Skeleton width="55%" sx={{ mt: 0.75 }} />
          </Box>
          <Skeleton width={72} height={28} />
        </Stack>
        <Stack
          direction="row"
          spacing={2}
          sx={{ justifyContent: 'space-between', alignItems: 'center' }}
        >
          <Skeleton width="30%" height={36} />
          <Skeleton width={48} />
          <Skeleton width="30%" height={36} />
        </Stack>
        <Skeleton width="70%" />
        <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
          <Skeleton width={88} height={36} />
          <Skeleton width={110} height={36} />
        </Stack>
      </Stack>
    </AppCard>
  );
}

export function FlightCardSkeleton({ count = 1, columns }: FlightCardSkeletonProps) {
  const items = Array.from({ length: count }).map((_, index) => (
    <FlightCardPlaceholder key={index} />
  ));

  return (
    <SkeletonBlock label="Loading flights">
      {columns ? (
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: {
              xs: `repeat(${columns.xs ?? 1}, minmax(0, 1fr))`,
              sm: columns.sm ? `repeat(${columns.sm}, minmax(0, 1fr))` : undefined,
              lg: columns.lg ? `repeat(${columns.lg}, minmax(0, 1fr))` : undefined,
            },
          }}
        >
          {items}
        </Box>
      ) : (
        <Stack spacing={1.75} sx={{ width: '100%' }}>
          {items}
        </Stack>
      )}
    </SkeletonBlock>
  );
}

/** Compact list used by flight search results (matches ~280px card height). */
export function FlightResultsSkeleton({ count = 3 }: FlightCardSkeletonProps) {
  return <FlightCardSkeleton count={count} />;
}
