import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { ArrowRight, Trash2 } from 'lucide-react';
import { AppButton, AppCard } from '@/components/common';
import type { RecentFlightSearch } from '../../types/recentSearch';
import {
  formatRecentSearchDates,
  formatRecentSearchMeta,
  formatRecentSearchRoute,
} from '../../utils/recentSearch';

export interface RecentSearchCardProps {
  search: RecentFlightSearch;
  onRepeat: (search: RecentFlightSearch) => void;
  onRemove: (id: string) => void;
}

export function RecentSearchCard({ search, onRepeat, onRemove }: RecentSearchCardProps) {
  return (
    <AppCard
      title={formatRecentSearchRoute(search)}
      subtitle={formatRecentSearchDates(search)}
      action={
        <IconButton
          size="small"
          aria-label={`Remove search ${formatRecentSearchRoute(search)}`}
          onClick={() => onRemove(search.id)}
        >
          <Trash2 aria-hidden="true" size={16} />
        </IconButton>
      }
      sx={{ height: '100%' }}
    >
      <Stack spacing={1.5}>
        <Typography variant="body2" color="text.secondary">
          {formatRecentSearchMeta(search)}
        </Typography>
        <AppButton
          size="small"
          variant="contained"
          endIcon={<ArrowRight aria-hidden="true" size={16} />}
          onClick={() => onRepeat(search)}
        >
          Search again
        </AppButton>
      </Stack>
    </AppCard>
  );
}
