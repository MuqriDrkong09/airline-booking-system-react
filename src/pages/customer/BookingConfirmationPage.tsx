import { Link as RouterLink, useParams } from 'react-router-dom';
import { AppButton, EmptyState, PageContainer } from '@/components/common';
import { APP_ROUTES } from '@/constants/routes';
import { BookingConfirmationView, useBookingsStore } from '@/features/booking';

export function BookingConfirmationPage() {
  const { bookingReference = '' } = useParams<{ bookingReference: string }>();
  const booking = useBookingsStore((state) =>
    state.bookings.find((item) => item.reference === bookingReference),
  );

  if (!booking) {
    return (
      <PageContainer title="Booking confirmation">
        <EmptyState
          title="Booking not found"
          message="We could not find this booking reference. It may have been cleared from this browser."
          action={
            <AppButton
              component={RouterLink}
              to={APP_ROUTES.customer.bookings}
              variant="contained"
            >
              My bookings
            </AppButton>
          }
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Booking confirmation"
      description={`Reference ${booking.reference} · ${booking.status}`}
      action={
        <AppButton
          component={RouterLink}
          to={APP_ROUTES.customer.bookings}
          variant="outlined"
          sx={{ '@media print': { display: 'none' } }}
        >
          My bookings
        </AppButton>
      }
    >
      <BookingConfirmationView booking={booking} />
    </PageContainer>
  );
}
