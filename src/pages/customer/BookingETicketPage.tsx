import { Link as RouterLink, useParams } from 'react-router-dom';
import { SearchX } from 'lucide-react';
import {
  AppButton,
  EmptyState,
  ErrorState,
  PageContainer,
  PageLoader,
} from '@/components/common';
import { APP_ROUTES } from '@/constants/routes';
import { BookingETicketView, useBookingDetail } from '@/features/booking';

export function BookingETicketPage() {
  const { bookingReference = '' } = useParams<{ bookingReference: string }>();
  const { status, booking, reference, retry } = useBookingDetail(bookingReference);

  if (status === 'loading') {
    return (
      <PageContainer title="E-ticket" description="Loading e-ticket…">
        <PageLoader label="Loading e-ticket…" />
      </PageContainer>
    );
  }

  if (status === 'error') {
    return (
      <PageContainer title="E-ticket">
        <ErrorState
          title="Invalid booking reference"
          message={
            reference
              ? `“${reference}” is not a valid booking reference.`
              : 'A booking reference is required to view an e-ticket.'
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
      <PageContainer title="E-ticket">
        <EmptyState
          icon={<SearchX aria-hidden size={40} />}
          title="E-ticket not found"
          message={
            reference
              ? `We could not find booking ${reference} to generate an e-ticket.`
              : 'We could not find this booking.'
          }
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
      title="E-ticket"
      description={`${booking.reference} · printable boarding pass`}
      sx={{
        '@media print': {
          maxWidth: 'none',
          px: 0,
          '& > .MuiStack-root > :first-of-type': { display: 'none' },
        },
      }}
    >
      <BookingETicketView booking={booking} />
    </PageContainer>
  );
}
