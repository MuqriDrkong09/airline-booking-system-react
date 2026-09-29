import Stack from '@mui/material/Stack';
import { SearchX } from 'lucide-react';
import { useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import {
  AppAlert,
  AppButton,
  EmptyState,
  ErrorState,
  PageContainer,
  PageLoader,
} from '@/components/common';
import { APP_ROUTES } from '@/constants/routes';
import {
  BOOKING_STATUS_LABELS,
  BookingCancellationDialog,
  BookingDetailView,
  canCancelBooking,
  formatBookingMoney,
  useBookingDetail,
} from '@/features/booking';
import { todayIsoDate } from '@/features/flights/utils/dates';

export function BookingDetailPage() {
  const { bookingReference = '' } = useParams<{ bookingReference: string }>();
  const { status, booking, reference, retry } = useBookingDetail(bookingReference);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const todayIso = todayIsoDate();

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

  const showCancel = canCancelBooking(booking, todayIso);

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
          {showCancel ? (
            <AppButton variant="outlined" color="error" onClick={() => setCancelOpen(true)}>
              Cancel booking
            </AppButton>
          ) : null}
          <AppButton
            component={RouterLink}
            to={APP_ROUTES.customer.bookingManage(booking.reference)}
            variant="contained"
          >
            Manage
          </AppButton>
          <AppButton
            component={RouterLink}
            to={APP_ROUTES.customer.bookingETicket(booking.reference)}
            variant="outlined"
          >
            E-ticket
          </AppButton>
          <AppButton
            component={RouterLink}
            to={APP_ROUTES.customer.bookingInvoice(booking.reference)}
            variant="outlined"
          >
            Invoice
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
      <Stack spacing={2.5}>
        {feedback ? (
          <AppAlert severity="success" onClose={() => setFeedback(null)}>
            {feedback}
          </AppAlert>
        ) : null}

        {booking.cancellation ? (
          <AppAlert
            severity={booking.status === 'REFUNDED' ? 'success' : 'info'}
            title={BOOKING_STATUS_LABELS[booking.status]}
          >
            Cancellation fee{' '}
            {formatBookingMoney(booking.cancellation.fee, booking.cancellation.currency)}
            . Refund{' '}
            {formatBookingMoney(
              booking.cancellation.refundAmount,
              booking.cancellation.currency,
            )}
            .
          </AppAlert>
        ) : null}

        <BookingDetailView booking={booking} />
      </Stack>

      <BookingCancellationDialog
        open={cancelOpen}
        booking={booking}
        onClose={() => setCancelOpen(false)}
        onCompleted={(updated) => {
          setFeedback(
            `Booking ${updated.reference} is now ${BOOKING_STATUS_LABELS[updated.status].toLowerCase()}.`,
          );
        }}
      />
    </PageContainer>
  );
}
