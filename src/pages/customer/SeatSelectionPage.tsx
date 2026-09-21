import Stack from '@mui/material/Stack';
import { useEffect, useMemo } from 'react';
import { Link as RouterLink, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { AppButton, EmptyState, PageContainer } from '@/components/common';
import { APP_ROUTES } from '@/constants/routes';
import {
  passengerDisplayName,
  SeatSelectionPanel,
  useSeatSelectionStore,
} from '@/features/seats';
import { usePassengerDraftStore } from '@/features/passengers';

export function SeatSelectionPage() {
  const { flightId = '' } = useParams<{ flightId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const trip = usePassengerDraftStore((state) => state.trip);
  const passengers = usePassengerDraftStore((state) => state.passengers);
  const initSelection = useSeatSelectionStore((state) => state.initSelection);

  const query = searchParams.toString();
  const passengersHref = flightId
    ? `${APP_ROUTES.customer.flightPassengers(flightId)}${query ? `?${query}` : ''}`
    : APP_ROUTES.customer.flights;
  const detailsHref = flightId
    ? `${APP_ROUTES.customer.flightDetails(flightId)}${query ? `?${query}` : ''}`
    : APP_ROUTES.customer.flights;

  const seatPassengers = useMemo(
    () =>
      passengers.map((passenger, index) => ({
        id: passenger.id,
        type: passenger.type,
        firstName: passenger.firstName,
        lastName: passenger.lastName,
        displayName: passengerDisplayName(
          passenger.firstName,
          passenger.lastName,
          `${passenger.type === 'ADULT' ? 'Adult' : passenger.type === 'CHILD' ? 'Child' : 'Infant'} ${index + 1}`,
        ),
      })),
    [passengers],
  );

  const tripMatches =
    Boolean(flightId) && trip?.flightId === flightId && seatPassengers.length > 0;

  useEffect(() => {
    if (!tripMatches) {
      return;
    }
    initSelection({
      flightId,
      aircraftModel: 'Airbus A320',
      passengers: seatPassengers,
    });
  }, [flightId, initSelection, seatPassengers, tripMatches]);

  if (!tripMatches) {
    return (
      <PageContainer title="Select seats">
        <EmptyState
          title="Passenger details required"
          message="Save passenger information for this flight before choosing seats."
          action={
            <AppButton component={RouterLink} to={passengersHref} variant="contained">
              Passenger details
            </AppButton>
          }
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Select seats"
      description={`${trip?.from} → ${trip?.to} · ${trip?.departure} · assign seats for each adult and child.`}
      action={
        <Stack direction="row" spacing={1}>
          <AppButton component={RouterLink} to={passengersHref} variant="outlined">
            Passengers
          </AppButton>
          <AppButton component={RouterLink} to={detailsHref} variant="text">
            Flight
          </AppButton>
        </Stack>
      }
    >
      <SeatSelectionPanel
        onSaved={() => {
          navigate({
            pathname: APP_ROUTES.customer.flightBaggage(flightId),
            search: searchParams.toString(),
          });
        }}
      />
    </PageContainer>
  );
}
