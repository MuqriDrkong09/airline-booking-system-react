import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import { AppCard } from '../AppCard';
import { SkeletonBlock } from './SkeletonBlock';

export interface BookingCardSkeletonProps {
  count?: number;
}

export function BookingCardSkeleton({ count = 3 }: BookingCardSkeletonProps) {
  return (
    <SkeletonBlock label="Loading bookings">
      <Stack spacing={1.75} sx={{ width: '100%' }}>
        {Array.from({ length: count }).map((_, index) => (
          <AppCard
            key={index}
            outlined
            sx={{
              '& .MuiCardContent-root': {
                p: 2,
                '&:last-child': { pb: 2 },
              },
            }}
          >
            <Stack spacing={1.75}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1}
                sx={{ justifyContent: 'space-between' }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Skeleton width={120} height={14} />
                  <Skeleton width="45%" height={28} sx={{ mt: 0.75 }} />
                  <Skeleton width="60%" sx={{ mt: 0.75 }} />
                </Box>
                <Skeleton width={88} height={28} />
              </Stack>
              <Stack direction="row" spacing={2}>
                <Skeleton width="28%" height={40} />
                <Skeleton width={40} />
                <Skeleton width="28%" height={40} />
              </Stack>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                <Skeleton width={72} height={32} />
                <Skeleton width={88} height={32} />
                <Skeleton width={96} height={32} />
              </Stack>
            </Stack>
          </AppCard>
        ))}
      </Stack>
    </SkeletonBlock>
  );
}
