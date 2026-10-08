import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import { AppCard } from '../AppCard';
import { SkeletonBlock } from './SkeletonBlock';

export function ProfileSkeleton() {
  return (
    <SkeletonBlock label="Loading profile">
      <Stack spacing={3}>
        <AppCard title={<Skeleton width="40%" />} subtitle={<Skeleton width="55%" />}>
          <Stack spacing={2}>
            {Array.from({ length: 4 }).map((_, index) => (
              <Box key={index}>
                <Skeleton width="25%" sx={{ mb: 1 }} />
                <Skeleton height={40} />
              </Box>
            ))}
          </Stack>
        </AppCard>
        <AppCard title={<Skeleton width="35%" />}>
          <Stack spacing={2}>
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} height={40} />
            ))}
          </Stack>
        </AppCard>
      </Stack>
    </SkeletonBlock>
  );
}
