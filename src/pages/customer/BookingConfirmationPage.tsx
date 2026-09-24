import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Link as RouterLink, useParams } from 'react-router-dom';
import {
  AppBadge,
  AppButton,
  AppCard,
  EmptyState,
  PageContainer,
} from '@/components/common';
import { APP_ROUTES } from '@/constants/routes';
import {
  formatBookingMoney,
  useBookingsStore,
  type BookingRecordStatus,
} from '@/features/booking';

const STATUS_TONE: Record<
  BookingRecordStatus,
  'default' | 'info' | 'success' | 'warning' | 'error'
> = {
  PENDING: 'warning',
  CONFIRMED: 'success',
  CANCELLED: 'error',
  CHECKED_IN: 'info',
  COMPLETED: 'default',
  REFUNDED: 'warning',
};

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

  const { flight, priceBreakdown, payment } = booking;

  return (
    <PageContainer
      title="Booking confirmed"
      description={`Reference ${booking.reference}`}
      action={
        <AppButton component={RouterLink} to={APP_ROUTES.customer.bookings} variant="outlined">
          My bookings
        </AppButton>
      }
    >
      <Stack spacing={2.5} sx={{ maxWidth: 720 }}>
        <AppCard
          title="Thank you"
          subtitle="Your payment succeeded and the booking was saved."
          action={
            <AppBadge label={booking.status} tone={STATUS_TONE[booking.status]} />
          }
        >
          <Stack spacing={1.25}>
            <Typography variant="body2" color="text.secondary">
              Booking reference
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {booking.reference}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Transaction {booking.transactionId}
            </Typography>
          </Stack>
        </AppCard>

        <AppCard title="Flight" subtitle={`${flight.airline.name} ${flight.flightNumber}`}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {flight.origin.code} → {flight.destination.code}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {flight.origin.city} to {flight.destination.city} · {booking.passengers.length}{' '}
            passenger{booking.passengers.length === 1 ? '' : 's'}
          </Typography>
        </AppCard>

        <AppCard title="Payment" subtitle="Safe payment snapshot only.">
          <Stack spacing={0.75}>
            <Typography variant="body2">
              Method: {payment.method ?? '—'}
              {payment.cardBrand ? ` · ${payment.cardBrand}` : ''}
              {payment.cardLast4 ? ` ·•••• ${payment.cardLast4}` : ''}
            </Typography>
            <Typography variant="body2">
              Total paid:{' '}
              {formatBookingMoney(priceBreakdown.finalTotal, priceBreakdown.currency)}
            </Typography>
          </Stack>
        </AppCard>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          sx={{ justifyContent: 'flex-end', alignItems: { xs: 'stretch', sm: 'center' } }}
        >
          <AppButton
            component={RouterLink}
            to={APP_ROUTES.customer.flights}
            variant="contained"
          >
            Book another flight
          </AppButton>
          <AppButton
            component={RouterLink}
            to={APP_ROUTES.customer.bookings}
            variant="outlined"
          >
            View bookings
          </AppButton>
        </Stack>
      </Stack>
    </PageContainer>
  );
}
