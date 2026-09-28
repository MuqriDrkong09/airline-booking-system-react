import Stack from '@mui/material/Stack';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { AppButton, EmptyState, PageContainer } from '@/components/common';
import { APP_ROUTES } from '@/constants/routes';
import {
  BookingConfirmationActions,
  BookingConfirmationDetails,
  BookingConfirmationSuccess,
  useBookingsStore,
} from '@/features/booking';

export function BookingDetailPage() {
  const { bookingReference = '' } = useParams<{ bookingReference: string }>();
  const booking = useBookingsStore((state) =>
    state.bookings.find((item) => item.reference === bookingReference),
  );

  if (!booking) {
    return (
      <PageContainer title="Booking">
        <EmptyState
          title="Booking not found"
          message="We could not find this booking reference. It may have been cleared from this browser."
          action={
            <Stack direction="row" spacing={1.25} useFlexGap sx={{ flexWrap: 'wrap' }}>
              <AppButton
                component={RouterLink}
                to={APP_ROUTES.customer.bookings}
                variant="contained"
              >
                My bookings
              </AppButton>
              <AppButton
                component={RouterLink}
                to={APP_ROUTES.customer.flights}
                variant="outlined"
              >
                Search flights
              </AppButton>
            </Stack>
          }
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Manage booking"
      description={`Reference ${booking.reference} · ${booking.status}`}
      action={
        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
          <AppButton
            component={RouterLink}
            to={APP_ROUTES.customer.bookings}
            variant="outlined"
          >
            My bookings
          </AppButton>
          <AppButton
            component={RouterLink}
            to={APP_ROUTES.customer.bookingConfirmation(booking.reference)}
            variant="outlined"
          >
            Confirmation
          </AppButton>
        </Stack>
      }
    >
      <Stack spacing={2.5} sx={{ maxWidth: 800 }}>
        <BookingConfirmationSuccess booking={booking} />
        <BookingConfirmationDetails booking={booking} />
        <BookingConfirmationActions booking={booking} />
      </Stack>
    </PageContainer>
  );
}
