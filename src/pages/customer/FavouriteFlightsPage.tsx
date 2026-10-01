import { Link as RouterLink } from 'react-router-dom';
import { AppButton, PageContainer } from '@/components/common';
import { APP_ROUTES } from '@/constants/routes';
import { FavouritesView } from '@/features/favourites';

export function FavouriteFlightsPage() {
  return (
    <PageContainer
      title="Favourite flights"
      description="Flights you saved from search and details. Open a flight to continue booking."
      action={
        <AppButton component={RouterLink} to={APP_ROUTES.customer.flights} variant="contained">
          Search flights
        </AppButton>
      }
    >
      <FavouritesView />
    </PageContainer>
  );
}
