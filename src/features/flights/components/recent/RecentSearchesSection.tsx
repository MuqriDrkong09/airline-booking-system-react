import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useNavigate } from 'react-router-dom';
import { AppButton, SectionHeader } from '@/components/common';
import { APP_ROUTES } from '@/constants/routes';
import { useRecentSearchesStore } from '../../store/recentSearchesStore';
import { criteriaFromRecentSearch } from '../../utils/recentSearch';
import { serializeFlightSearchCriteria } from '../../utils/searchParams';
import { RecentSearchCard } from './RecentSearchCard';

export function RecentSearchesSection() {
  const navigate = useNavigate();
  const searches = useRecentSearchesStore((state) => state.searches);
  const removeSearch = useRecentSearchesStore((state) => state.removeSearch);
  const clearHistory = useRecentSearchesStore((state) => state.clearHistory);

  if (searches.length === 0) {
    return null;
  }

  const handleRepeat = (search: (typeof searches)[number]) => {
    const params = serializeFlightSearchCriteria(criteriaFromRecentSearch(search));
    void navigate({
      pathname: APP_ROUTES.customer.flights,
      search: params.toString(),
    });
  };

  return (
    <Stack spacing={2}>
      <SectionHeader
        component="h2"
        title="Recent searches"
        description="Pick up where you left off with your latest flight searches."
        action={
          <AppButton variant="text" color="inherit" onClick={() => clearHistory()}>
            Clear all
          </AppButton>
        }
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
            md: 'repeat(3, minmax(0, 1fr))',
          },
          gap: 2,
        }}
      >
        {searches.map((search) => (
          <RecentSearchCard
            key={search.id}
            search={search}
            onRepeat={handleRepeat}
            onRemove={removeSearch}
          />
        ))}
      </Box>

      <Typography variant="caption" color="text.secondary">
        Showing up to your 10 most recent searches on this device.
      </Typography>
    </Stack>
  );
}
