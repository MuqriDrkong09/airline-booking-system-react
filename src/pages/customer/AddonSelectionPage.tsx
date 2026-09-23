import { useMemo } from 'react';
import { Link as RouterLink, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AppButton, EmptyState, PageContainer } from '@/components/common';
import { APP_ROUTES } from '@/constants/routes';
import { AddonSelectionPanel } from '@/features/addons';
import { usePassengerDraftStore } from '@/features/passengers';
import { passengerDisplayName } from '@/features/seats';

export function AddonSelectionPage() {
  const { flightId = '' } = useParams<{ flightId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const trip = usePassengerDraftStore((state) => state.trip);
  const passengers = usePassengerDraftStore((state) => state.passengers);

  const query = searchParams.toString();
  const mealsHref = flightId
    ? `${APP_ROUTES.customer.flightMeals(flightId)}${query ? `?${query}` : ''}`
    : APP_ROUTES.customer.flights;

  const addonPassengers = useMemo(
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
    Boolean(flightId) && trip?.flightId === flightId && addonPassengers.length > 0;

  if (!tripMatches) {
    return (
      <PageContainer title="Add-ons">
        <EmptyState
          title="Passenger details required"
          message="Save passenger information for this flight before choosing add-ons."
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
      title="Add-ons"
      description={`${trip?.from} → ${trip?.to} · optional extras for your trip.`}
      action={
        <AppButton component={RouterLink} to={mealsHref} variant="outlined">
          Meals
        </AppButton>
      }
    >
      <AddonSelectionPanel
        flightId={flightId}
        passengers={addonPassengers}
        onSaved={() => {
          navigate({
            pathname: APP_ROUTES.customer.flightSummary(flightId),
            search: searchParams.toString(),
          });
        }}
      />
    </PageContainer>
  );
}
