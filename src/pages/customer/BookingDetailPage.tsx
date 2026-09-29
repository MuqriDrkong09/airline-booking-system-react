import Stack from '@mui/material/Stack';
import { SearchX } from 'lucide-react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import {
  AppButton,
  EmptyState,
  ErrorState,
  PageContainer,
  PageLoader,
} from '@/components/common';
import { APP_ROUTES } from '@/constants/routes';
import {
  BOOKING_STATUS_LABELS,
  BookingDetailView,
  useBookingDetail,
} from '@/features/booking';

export function BookingDetailPage() {
  const { bookingReference = '' } = useParams<{ bookingReference: string }>();
  const { status, booking, reference, retry } = useBookingDetail(bookingReference);

  if (status === 'loading') {
    return (
      <PageContainer title="Booking details" description="Loading booking…">
        <PageLoader label="Loading booking details…" />
      </PageContainer>
    );
  }

  if (status === 'error') {
    return (
      <PageContainer title="Booking details">
        <ErrorState
          title="Invalid booking reference"
          message={
            reference
              ? `“${reference}” is not a valid booking reference.`
              : 'A booking reference is required to view booking details.'
          }
          onRetry={retry}
          action={
            <AppButton
              component={RouterLink}
              to={APP_ROUTES.customer.bookings}
              variant="outlined"
              sx={{ mt: 1 }}
            >
              My bookings
            </AppButton>
          }
        />
      </PageContainer>
    );
  }

  if (status === 'not_found' || !booking) {
    return (
      <PageContainer title="Booking details">
        <EmptyState
          icon={<SearchX aria-hidden size={40} />}
          title="Booking not found"
          message={
            reference
              ? `We could not find booking ${reference}. It may have been cleared from this browser.`
              : 'We could not find this booking.'
          }
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
              <AppButton variant="text" onClick={retry}>
                Try again
              </AppButton>
            </Stack>
          }
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Booking details"
      description={`Reference ${booking.reference} · ${BOOKING_STATUS_LABELS[booking.status]}`}
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
            to={APP_ROUTES.customer.bookingManage(booking.reference)}
            variant="contained"
          >
            Manage
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
      <BookingDetailView booking={booking} />
    </PageContainer>
  );
}
