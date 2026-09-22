import { useMemo } from 'react';
import { Link as RouterLink, useParams, useSearchParams } from 'react-router-dom';
import { AppButton, EmptyState, PageContainer } from '@/components/common';
import { APP_ROUTES } from '@/constants/routes';
import { MealSelectionPanel } from '@/features/meals';
import { usePassengerDraftStore } from '@/features/passengers';
import { passengerDisplayName } from '@/features/seats';

export function MealSelectionPage() {
  const { flightId = '' } = useParams<{ flightId: string }>();
  const [searchParams] = useSearchParams();
  const trip = usePassengerDraftStore((state) => state.trip);
  const passengers = usePassengerDraftStore((state) => state.passengers);

  const query = searchParams.toString();
  const baggageHref = flightId
    ? `${APP_ROUTES.customer.flightBaggage(flightId)}${query ? `?${query}` : ''}`
    : APP_ROUTES.customer.flights;

  const mealPassengers = useMemo(
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
    Boolean(flightId) && trip?.flightId === flightId && mealPassengers.length > 0;

  if (!tripMatches) {
    return (
      <PageContainer title="Meals">
        <EmptyState
          title="Passenger details required"
          message="Save passenger information for this flight before choosing meals."
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
      title="Meals"
      description={`${trip?.from} → ${trip?.to} · choose special meals per passenger.`}
      action={
        <AppButton component={RouterLink} to={baggageHref} variant="outlined">
          Baggage
        </AppButton>
      }
    >
      <MealSelectionPanel flightId={flightId} passengers={mealPassengers} />
    </PageContainer>
  );
}
