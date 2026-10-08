import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import { AppCard } from '../AppCard';
import { SkeletonBlock } from './SkeletonBlock';

export interface ChartSkeletonProps {
  count?: number;
  /** Match dashboard/report chart shells (260–300px). */
  height?: { xs?: number; md?: number } | number;
  columns?: { xs?: number; lg?: number };
}

export function ChartSkeleton({
  count = 4,
  height = { xs: 260, md: 300 },
  columns = { xs: 1, lg: 2 },
}: ChartSkeletonProps) {
  const chartHeight = typeof height === 'number' ? height : height.md ?? height.xs ?? 280;

  return (
    <SkeletonBlock label="Loading charts">
      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: {
            xs: `repeat(${columns.xs ?? 1}, minmax(0, 1fr))`,
            lg: columns.lg ? `repeat(${columns.lg}, minmax(0, 1fr))` : undefined,
          },
        }}
      >
        {Array.from({ length: count }).map((_, index) => (
          <AppCard
            key={index}
            title={<Skeleton width="45%" />}
            subtitle={<Skeleton width="65%" />}
            sx={{ height: '100%' }}
          >
            <Box sx={{ width: '100%', minHeight: 260, height: chartHeight }}>
              <Stack spacing={1.5} sx={{ height: '100%', justifyContent: 'flex-end', pb: 1 }}>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: 'flex-end', height: '100%', px: 1 }}
                >
                  {[48, 72, 56, 90, 64, 80, 52].map((barHeight, barIndex) => (
                    <Skeleton
                      key={barIndex}
                      variant="rounded"
                      width="100%"
                      height={`${barHeight}%`}
                      sx={{ flex: 1 }}
                    />
                  ))}
                </Stack>
                <Skeleton width="100%" height={8} />
              </Stack>
            </Box>
          </AppCard>
        ))}
      </Box>
    </SkeletonBlock>
  );
}
