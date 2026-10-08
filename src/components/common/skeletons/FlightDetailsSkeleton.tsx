import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import { AppCard } from '../AppCard';
import { SkeletonBlock } from './SkeletonBlock';

export function FlightDetailsSkeleton() {
  return (
    <SkeletonBlock label="Loading flight details">
      <Stack spacing={2.5} sx={{ maxWidth: 1100 }}>
        <AppCard>
          <Stack spacing={2}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
              <Skeleton variant="circular" width={48} height={48} />
              <Box sx={{ flex: 1 }}>
                <Skeleton width="35%" height={28} />
                <Skeleton width="50%" sx={{ mt: 0.75 }} />
              </Box>
              <Skeleton width={96} height={36} />
            </Stack>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{ justifyContent: 'space-between' }}
            >
              <Skeleton width="30%" height={48} />
              <Skeleton width={64} />
              <Skeleton width="30%" height={48} />
            </Stack>
          </Stack>
        </AppCard>

        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
          }}
        >
          <AppCard title={<Skeleton width="40%" />}>
            <Stack spacing={1.5}>
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} width="85%" />
              ))}
            </Stack>
          </AppCard>
          <AppCard title={<Skeleton width="45%" />}>
            <Stack spacing={1.5}>
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} width="80%" />
              ))}
            </Stack>
          </AppCard>
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <Skeleton width={140} height={40} />
          <Skeleton width={180} height={40} />
        </Stack>
      </Stack>
    </SkeletonBlock>
  );
}
