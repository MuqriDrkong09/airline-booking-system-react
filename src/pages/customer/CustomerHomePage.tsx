import { Link as RouterLink } from 'react-router-dom';
import { AppButton, PageContainer } from '@/components/common';
import { APP_ROUTES } from '@/constants/routes';
import { CustomerHomeView } from '@/features/customerHome';

export function CustomerHomePage() {
  return (
    <PageContainer
      title="Home"
      description="Your trips, quick actions, and recent flight activity."
      action={
        <AppButton
          component={RouterLink}
          to={APP_ROUTES.customer.flights}
          variant="contained"
        >
          Search flights
        </AppButton>
      }
    >
      <CustomerHomeView />
    </PageContainer>
  );
}
