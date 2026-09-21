import Stack from '@mui/material/Stack';
import { useMemo } from 'react';
import { Link as RouterLink, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  AppButton,
  EmptyState,
  ErrorState,
  PageContainer,
  PageLoader,
} from '@/components/common';
import { APP_ROUTES } from '@/constants/routes';
import {
  FlightDetails,
  parseFlightSearchParams,
  useFlightDetailsQuery,
  type FlightSearchRequest,
} from '@/features/flights';
import { useBookingStore } from '@/features/booking';
import { usePassengerDraftStore } from '@/features/passengers';
import { useSeatSelectionStore } from '@/features/seats';

function toSearchContext(
  criteria: ReturnType<typeof parseFlightSearchParams>,
): Partial<FlightSearchRequest> | null {
  if (!criteria) {
    return null;
  }

  if (criteria.tripType === 'MULTI_CITY' && criteria.legs?.[0]) {
    const leg = criteria.legs[0];
    return {
      from: leg.from,
      to: leg.to,
      departure: leg.departure,
      adults: criteria.adults ?? 1,
      children: criteria.children ?? 0,
      infants: criteria.infants ?? 0,
      cabinClass: criteria.cabinClass ?? 'ECONOMY',
      tripType: criteria.tripType,
    };
  }

  return {
    from: criteria.from,
    to: criteria.to,
    departure: criteria.departure,
    returnDate: criteria.returnDate,
    adults: criteria.adults ?? 1,
    children: criteria.children ?? 0,
    infants: criteria.infants ?? 0,
    cabinClass: criteria.cabinClass ?? 'ECONOMY',
    tripType: criteria.tripType,
  };
}

export function FlightDetailsPage() {
  const { flightId = '' } = useParams<{ flightId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const clearPassengerDraft = usePassengerDraftStore((state) => state.clearDraft);
  const clearSeatSelection = useSeatSelectionStore((state) => state.clearSelection);
  const clearBooking = useBookingStore((state) => state.clearBooking);

  const context = useMemo(() => {
    const parsed = parseFlightSearchParams(searchParams);
    return toSearchContext(parsed);
  }, [searchParams]);

  const detailsQuery = useFlightDetailsQuery(flightId, context);
  const resultsHref = `${APP_ROUTES.customer.flights}${
    searchParams.toString() ? `?${searchParams.toString()}` : ''
  }`;

  if (detailsQuery.isLoading) {
    return (
      <PageContainer
        title="Flight details"
        description="Review aircraft, schedule, baggage, amenities, and fare rules before you continue."
      >
        <PageLoader label="Loading flight details…" />
      </PageContainer>
    );
  }

  if (detailsQuery.isError) {
    return (
      <PageContainer title="Flight details">
        <ErrorState
          title="Unable to load flight"
          message="We could not load this flight right now. Please try again."
          onRetry={() => {
            void detailsQuery.refetch();
          }}
        />
        <AppButton component={RouterLink} to={resultsHref} variant="outlined" sx={{ mt: 2 }}>
          Back to results
        </AppButton>
      </PageContainer>
    );
  }

  if (!detailsQuery.data) {
    return (
      <PageContainer title="Flight details">
        <EmptyState
          title="Flight not found"
          message="This flight may no longer be available. Return to search results and choose another option."
          action={
            <AppButton component={RouterLink} to={resultsHref} variant="contained">
              Back to results
            </AppButton>
          }
        />
      </PageContainer>
    );
  }

  const flight = detailsQuery.data;

  return (
    <PageContainer
      title="Flight details"
      description={`${flight.origin.code} → ${flight.destination.code} · ${flight.airline.name} ${flight.flightNumber}`}
      action={
        <AppButton component={RouterLink} to={resultsHref} variant="outlined">
          Back to results
        </AppButton>
      }
    >
      <Stack spacing={2.5} sx={{ maxWidth: 1100 }}>
        <FlightDetails
          flight={flight}
          onSelectFlight={(next) => {
            clearPassengerDraft();
            clearSeatSelection();
            clearBooking();
            navigate({
              pathname: APP_ROUTES.customer.flightPassengers(next.id),
              search: searchParams.toString(),
            });
          }}
        />
      </Stack>
    </PageContainer>
  );
}
