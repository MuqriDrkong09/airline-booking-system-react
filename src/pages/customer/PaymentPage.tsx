import { useMemo } from 'react';
import { Link as RouterLink, useParams, useSearchParams } from 'react-router-dom';
import { AppButton, EmptyState, PageContainer } from '@/components/common';
import { APP_ROUTES } from '@/constants/routes';
import { useBookingStore } from '@/features/booking';
import { PaymentPanel } from '@/features/payment';

function withQuery(path: string, query: string): string {
  return query ? `${path}?${query}` : path;
}

export function PaymentPage() {
  const { flightId = '' } = useParams<{ flightId: string }>();
  const [searchParams] = useSearchParams();
  const query = searchParams.toString();

  const bookingFlightId = useBookingStore((state) => state.flightId);
  const selectedFlight = useBookingStore((state) => state.selectedFlight);
  const passengers = useBookingStore((state) => state.passengers);
  const priceBreakdown = useBookingStore((state) => state.priceBreakdown);

  const summaryHref = flightId
    ? withQuery(APP_ROUTES.customer.flightSummary(flightId), query)
    : APP_ROUTES.customer.flights;

  const hasBookingContext = Boolean(
    flightId &&
      (bookingFlightId === flightId || selectedFlight?.id === flightId) &&
      (passengers.length > 0 || priceBreakdown.finalTotal > 0 || selectedFlight),
  );

  const description = useMemo(() => {
    if (!selectedFlight) {
      return 'Complete a mock payment for this booking.';
    }
    return `${selectedFlight.origin.code} → ${selectedFlight.destination.code} · pay securely (mock).`;
  }, [selectedFlight]);

  if (!flightId || !hasBookingContext) {
    return (
      <PageContainer title="Payment">
        <EmptyState
          title="No booking ready for payment"
          message="Review your booking summary first, then continue to payment."
          action={
            <AppButton
              component={RouterLink}
              to={flightId ? summaryHref : APP_ROUTES.customer.flights}
              variant="contained"
            >
              {flightId ? 'Booking summary' : 'Search flights'}
            </AppButton>
          }
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Payment"
      description={description}
      action={
        <AppButton component={RouterLink} to={summaryHref} variant="outlined">
          Summary
        </AppButton>
      }
    >
      <PaymentPanel
        flightId={flightId}
        summaryHref={summaryHref}
        bookingsHref={APP_ROUTES.customer.bookings}
      />
    </PageContainer>
  );
}
