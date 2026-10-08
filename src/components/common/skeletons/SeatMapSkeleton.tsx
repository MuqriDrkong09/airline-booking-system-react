import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import { AppCard } from '../AppCard';
import { SkeletonBlock } from './SkeletonBlock';

export interface SeatMapSkeletonProps {
  /** Include the side inspector column used on customer seat selection. */
  showInspector?: boolean;
}

export function SeatMapSkeleton({ showInspector = true }: SeatMapSkeletonProps) {
  return (
    <SkeletonBlock label="Loading seat map">
      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: {
            xs: '1fr',
            md: showInspector ? 'minmax(0, 1fr) minmax(280px, 340px)' : '1fr',
          },
          alignItems: 'start',
        }}
      >
        <AppCard title={<Skeleton width="30%" />} subtitle={<Skeleton width="50%" />}>
          <Stack spacing={1.5} sx={{ minWidth: { xs: 320, md: 420 }, py: 1.5 }}>
            <Stack direction="row" spacing={1} sx={{ justifyContent: 'center' }}>
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} width={48} height={18} />
              ))}
            </Stack>
            {Array.from({ length: 10 }).map((_, rowIndex) => (
              <Stack
                key={rowIndex}
                direction="row"
                spacing={1}
                sx={{ justifyContent: 'center', alignItems: 'center' }}
              >
                <Skeleton width={24} height={20} />
                {Array.from({ length: 3 }).map((__, seatIndex) => (
                  <Skeleton
                    key={`l-${seatIndex}`}
                    variant="rounded"
                    width={36}
                    height={36}
                  />
                ))}
                <Box sx={{ width: 28 }} />
                {Array.from({ length: 3 }).map((__, seatIndex) => (
                  <Skeleton
                    key={`r-${seatIndex}`}
                    variant="rounded"
                    width={36}
                    height={36}
                  />
                ))}
                <Skeleton width={24} height={20} />
              </Stack>
            ))}
          </Stack>
        </AppCard>

        {showInspector ? (
          <AppCard title={<Skeleton width="45%" />}>
            <Stack spacing={1.5}>
              <Skeleton width="80%" />
              <Skeleton width="60%" />
              <Skeleton height={40} />
              <Skeleton height={40} />
              <Skeleton width="100%" height={44} />
            </Stack>
          </AppCard>
        ) : null}
      </Box>
    </SkeletonBlock>
  );
}
