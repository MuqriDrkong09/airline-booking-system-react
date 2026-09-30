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
import { BoardingPassView, useBookingDetail } from '@/features/booking';

export function BoardingPassPage() {
  const { bookingReference = '' } = useParams<{ bookingReference: string }>();
  const { status, booking, reference, retry } = useBookingDetail(bookingReference);

  if (status === 'loading') {
    return (
      <PageContainer title="Boarding pass" description="Loading boarding pass…">
        <PageLoader label="Loading boarding pass…" />
      </PageContainer>
    );
  }

  if (status === 'error') {
    return (
      <PageContainer title="Boarding pass">
        <ErrorState
          title="Invalid booking reference"
          message={
            reference
              ? `“${reference}” is not a valid booking reference.`
              : 'A booking reference is required to view a boarding pass.'
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
      <PageContainer title="Boarding pass">
        <EmptyState
          icon={<SearchX aria-hidden size={40} />}
          title="Boarding pass not found"
          message={
            reference
              ? `We could not find booking ${reference} to generate a boarding pass.`
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
      title="Boarding pass"
      description={`${booking.reference} · mobile-friendly · printable`}
      sx={{
        '@media print': {
          maxWidth: 'none',
          px: 0,
          '& > .MuiStack-root > :first-of-type': { display: 'none' },
        },
      }}
    >
      <BoardingPassView booking={booking} />
    </PageContainer>
  );
}
