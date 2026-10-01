import Box from '@mui/material/Box';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { AppButton, EmptyState, ErrorState, PageLoader } from '@/components/common';
import { APP_ROUTES } from '@/constants/routes';
import type { FlightOffer } from '@/features/flights';
import { useFavouritesQuery } from '../hooks/useFavourites';
import { FavouriteFlightCard } from './FavouriteFlightCard';

export function FavouritesView() {
  const navigate = useNavigate();
  const query = useFavouritesQuery();

  if (query.isLoading) {
    return <PageLoader label="Loading favourite flights" />;
  }

  if (query.isError) {
    return (
      <ErrorState
        title="Unable to load favourites"
        message="Please try again in a moment."
        onRetry={() => {
          void query.refetch();
        }}
      />
    );
  }

  const favourites = query.data ?? [];

  if (favourites.length === 0) {
    return (
      <EmptyState
        title="No favourite flights yet"
        message="Save flights from search results or flight details to find them here later."
        action={
          <AppButton component={RouterLink} to={APP_ROUTES.customer.flights} variant="contained">
            Search flights
          </AppButton>
        }
      />
    );
  }

  const handleSelect = (flight: FlightOffer) => {
    void navigate(APP_ROUTES.customer.flightDetails(flight.id));
  };

  return (
    <Box
      sx={{
        display: 'grid',
        gap: 2,
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, minmax(0, 1fr))',
          lg: 'repeat(3, minmax(0, 1fr))',
        },
      }}
    >
      {favourites.map((favourite) => (
        <FavouriteFlightCard
          key={favourite.id}
          flight={favourite.flight}
          onSelect={handleSelect}
        />
      ))}
    </Box>
  );
}
