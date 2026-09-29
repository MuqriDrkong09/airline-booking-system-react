import Stack from '@mui/material/Stack';
import { SearchX } from 'lucide-react';
import { useMemo } from 'react';
import { Link as RouterLink, useParams, useSearchParams } from 'react-router-dom';
import {
  AppButton,
  EmptyState,
  ErrorState,
  PageContainer,
  PageLoader,
} from '@/components/common';
import { APP_ROUTES } from '@/constants/routes';
import {
  canManageBooking,
  ManageBookingView,
  useBookingDetail,
  type ManageBookingSection,
} from '@/features/booking';

function parseSection(value: string | null): ManageBookingSection {
  switch (value) {
    case 'seats':
    case 'baggage':
    case 'meals':
    case 'addons':
    case 'contact':
    case 'flight':
      return value;
    default:
      return 'overview';
  }
}

export function ManageBookingPage() {
  const { bookingReference = '' } = useParams<{ bookingReference: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const section = useMemo(
    () => parseSection(searchParams.get('section')),
    [searchParams],
  );
  const { status, booking, reference, retry } = useBookingDetail(bookingReference);

  const setSection = (next: ManageBookingSection) => {
    const params = new URLSearchParams(searchParams);
    if (next === 'overview') {
      params.delete('section');
    } else {
      params.set('section', next);
    }
    setSearchParams(params, { replace: true });
  };

  if (status === 'loading') {
    return (
      <PageContainer title="Manage booking" description="Loading booking…">
        <PageLoader label="Loading booking…" />
      </PageContainer>
    );
  }

  if (status === 'error') {
    return (
      <PageContainer title="Manage booking">
        <ErrorState
          title="Invalid booking reference"
          message={
            reference
              ? `“${reference}” is not a valid booking reference.`
              : 'A booking reference is required.'
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
      <PageContainer title="Manage booking">
        <EmptyState
          icon={<SearchX aria-hidden size={40} />}
          title="Booking not found"
          message="We could not find this booking to manage."
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

  if (!canManageBooking(booking)) {
    return (
      <PageContainer title="Manage booking">
        <EmptyState
          title="Management unavailable"
          message="Cancelled or refunded bookings cannot be changed."
          action={
            <Stack direction="row" spacing={1.25}>
              <AppButton
                component={RouterLink}
                to={APP_ROUTES.customer.bookingDetail(booking.reference)}
                variant="contained"
              >
                View booking
              </AppButton>
              <AppButton
                component={RouterLink}
                to={APP_ROUTES.customer.bookings}
                variant="outlined"
              >
                My bookings
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
      description={`Reference ${booking.reference} · update seats, extras, contacts, or flight`}
      action={
        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
          <AppButton
            component={RouterLink}
            to={APP_ROUTES.customer.bookingDetail(booking.reference)}
            variant="outlined"
          >
            View details
          </AppButton>
          <AppButton
            component={RouterLink}
            to={APP_ROUTES.customer.bookings}
            variant="outlined"
          >
            My bookings
          </AppButton>
        </Stack>
      }
    >
      <ManageBookingView
        booking={booking}
        section={section}
        onSectionChange={setSection}
      />
    </PageContainer>
  );
}
