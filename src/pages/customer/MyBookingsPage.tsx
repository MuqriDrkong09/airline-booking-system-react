import { Link as RouterLink } from 'react-router-dom';
import { AppButton, PageContainer } from '@/components/common';
import { APP_ROUTES } from '@/constants/routes';
import { MyBookingsView } from '@/features/booking';

export function MyBookingsPage() {
  return (
    <PageContainer
      title="My Bookings"
      description="View upcoming, past, and cancelled bookings. Manage, check in, or download tickets."
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
      <MyBookingsView />
    </PageContainer>
  );
}
