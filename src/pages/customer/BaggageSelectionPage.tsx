import { useMemo } from 'react';
import { Link as RouterLink, useParams, useSearchParams } from 'react-router-dom';
import { AppButton, EmptyState, PageContainer } from '@/components/common';
import { APP_ROUTES } from '@/constants/routes';
import { BaggageSelectionPanel } from '@/features/baggage';
import { parseFlightSearchParams, type CabinClass } from '@/features/flights';
import { usePassengerDraftStore } from '@/features/passengers';
import { passengerDisplayName } from '@/features/seats';

export function BaggageSelectionPage() {
  const { flightId = '' } = useParams<{ flightId: string }>();
  const [searchParams] = useSearchParams();
  const trip = usePassengerDraftStore((state) => state.trip);
  const passengers = usePassengerDraftStore((state) => state.passengers);

  const parsed = useMemo(() => parseFlightSearchParams(searchParams), [searchParams]);
  const cabinClass: CabinClass = parsed?.cabinClass ?? 'ECONOMY';

  const query = searchParams.toString();
  const seatsHref = flightId
    ? `${APP_ROUTES.customer.flightSeats(flightId)}${query ? `?${query}` : ''}`
    : APP_ROUTES.customer.flights;

  const baggagePassengers = useMemo(
    () =>
      passengers.map((passenger, index) => ({
        id: passenger.id,
        type: passenger.type,
        displayName: passengerDisplayName(
          passenger.firstName,
          passenger.lastName,
          `${passenger.type === 'ADULT' ? 'Adult' : passenger.type === 'CHILD' ? 'Child' : 'Infant'} ${index + 1}`,
        ),
      })),
    [passengers],
  );

  const tripMatches =
    Boolean(flightId) && trip?.flightId === flightId && baggagePassengers.length > 0;

  if (!tripMatches) {
    return (
      <PageContainer title="Baggage">
        <EmptyState
          title="Passenger details required"
          message="Save passenger information for this flight before choosing baggage."
          action={
            <AppButton
              component={RouterLink}
              to={
                flightId
                  ? `${APP_ROUTES.customer.flightPassengers(flightId)}${query ? `?${query}` : ''}`
                  : APP_ROUTES.customer.flights
              }
              variant="contained"
            >
              Passenger details
            </AppButton>
          }
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Baggage"
      description={`${trip?.from} → ${trip?.to} · included allowance plus optional extra bags.`}
      action={
        <AppButton component={RouterLink} to={seatsHref} variant="outlined">
          Seats
        </AppButton>
      }
    >
      <BaggageSelectionPanel
        flightId={flightId}
        cabinClass={cabinClass}
        passengers={baggagePassengers}
      />
    </PageContainer>
  );
}
