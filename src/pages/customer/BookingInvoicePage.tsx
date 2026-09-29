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
import { BookingInvoiceView, useBookingDetail } from '@/features/booking';

export function BookingInvoicePage() {
  const { bookingReference = '' } = useParams<{ bookingReference: string }>();
  const { status, booking, reference, retry } = useBookingDetail(bookingReference);

  if (status === 'loading') {
    return (
      <PageContainer title="Invoice" description="Loading invoice…">
        <PageLoader label="Loading invoice…" />
      </PageContainer>
    );
  }

  if (status === 'error') {
    return (
      <PageContainer title="Invoice">
        <ErrorState
          title="Invalid booking reference"
          message={
            reference
              ? `“${reference}” is not a valid booking reference.`
              : 'A booking reference is required to view an invoice.'
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
      <PageContainer title="Invoice">
        <EmptyState
          icon={<SearchX aria-hidden size={40} />}
          title="Invoice not found"
          message={
            reference
              ? `We could not find booking ${reference} to generate an invoice.`
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
      title="Invoice"
      description={`${booking.reference} · printable receipt`}
      sx={{
        '@media print': {
          maxWidth: 'none',
          px: 0,
          // Hide chrome so only the invoice paper prints.
          '& > .MuiStack-root > :first-of-type': { display: 'none' },
        },
      }}
    >
      <BookingInvoiceView booking={booking} />
    </PageContainer>
  );
}
