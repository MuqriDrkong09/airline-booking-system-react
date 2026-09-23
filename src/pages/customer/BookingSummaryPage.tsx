import { useMemo } from 'react';
import { Link as RouterLink, useParams, useSearchParams } from 'react-router-dom';
import {
  AppButton,
  EmptyState,
  PageContainer,
  PageLoader,
} from '@/components/common';
import { APP_ROUTES } from '@/constants/routes';
import {
  BookingSummary,
  useBookingStore,
  useBookingSummaryHydration,
} from '@/features/booking';
import {
  parseFlightSearchParams,
  useFlightDetailsQuery,
  type FlightSearchCriteria,
  type FlightSearchRequest,
} from '@/features/flights';
import { usePassengerDraftStore } from '@/features/passengers';
import { useSeatSelectionStore } from '@/features/seats';

function toSearchCriteria(
  parsed: ReturnType<typeof parseFlightSearchParams>,
): FlightSearchCriteria | null {
  if (!parsed?.cabinClass) {
    return null;
  }

  const from =
    parsed.from ??
    (parsed.tripType === 'MULTI_CITY' ? parsed.legs?.[0]?.from : undefined);
  const to =
    parsed.to ?? (parsed.tripType === 'MULTI_CITY' ? parsed.legs?.[0]?.to : undefined);
  const departure =
    parsed.departure ??
    (parsed.tripType === 'MULTI_CITY' ? parsed.legs?.[0]?.departure : undefined);

  if (!from || !to || !departure) {
    return null;
  }

  return {
    tripType: parsed.tripType ?? 'ONE_WAY',
    from,
    to,
    departure,
    returnDate: parsed.returnDate,
    adults: parsed.adults ?? 1,
    children: parsed.children ?? 0,
    infants: parsed.infants ?? 0,
    cabinClass: parsed.cabinClass,
    legs: parsed.legs,
  };
}

function toSearchContext(
  criteria: FlightSearchCriteria | null,
): Partial<FlightSearchRequest> | null {
  if (!criteria) {
    return null;
  }
  return {
    from: criteria.from,
    to: criteria.to,
    departure: criteria.departure,
    returnDate: criteria.returnDate,
    adults: criteria.adults,
    children: criteria.children,
    infants: criteria.infants,
    cabinClass: criteria.cabinClass,
    tripType: criteria.tripType,
  };
}

function withQuery(path: string, query: string): string {
  return query ? `${path}?${query}` : path;
}

export function BookingSummaryPage() {
  const { flightId = '' } = useParams<{ flightId: string }>();
  const [searchParams] = useSearchParams();
  const query = searchParams.toString();

  const draftTrip = usePassengerDraftStore((state) => state.trip);
  const draftPassengers = usePassengerDraftStore((state) => state.passengers);
  const bookingPassengers = useBookingStore((state) => state.passengers);
  const bookingFlightId = useBookingStore((state) => state.flightId);
  const selectedFlight = useBookingStore((state) => state.selectedFlight);

  const seatContext = useSeatSelectionStore((state) => state.context);
  const seatSeats = useSeatSelectionStore((state) => state.seats);
  const seatAssignments = useSeatSelectionStore((state) => state.assignments);

  const searchCriteria = useMemo(
    () => toSearchCriteria(parseFlightSearchParams(searchParams)),
    [searchParams],
  );
  const context = useMemo(() => toSearchContext(searchCriteria), [searchCriteria]);
  const detailsQuery = useFlightDetailsQuery(flightId, context);

  const passengers =
    draftTrip?.flightId === flightId && draftPassengers.length > 0
      ? draftPassengers
      : bookingPassengers;

  useBookingSummaryHydration({
    flightId,
    flight: detailsQuery.data ?? selectedFlight,
    searchCriteria,
    passengers,
    seatSeats,
    seatAssignments,
    seatFlightId: seatContext?.flightId ?? null,
  });

  const editHrefs = useMemo(
    () => ({
      flight: withQuery(APP_ROUTES.customer.flightDetails(flightId), query),
      passengers: withQuery(APP_ROUTES.customer.flightPassengers(flightId), query),
      seats: withQuery(APP_ROUTES.customer.flightSeats(flightId), query),
      baggage: withQuery(APP_ROUTES.customer.flightBaggage(flightId), query),
      meals: withQuery(APP_ROUTES.customer.flightMeals(flightId), query),
      addons: withQuery(APP_ROUTES.customer.flightAddons(flightId), query),
      payment: withQuery(APP_ROUTES.customer.flightPayment(flightId), query),
    }),
    [flightId, query],
  );

  const hasBookingContext =
    Boolean(flightId) &&
    (bookingFlightId === flightId ||
      draftTrip?.flightId === flightId ||
      selectedFlight?.id === flightId ||
      Boolean(detailsQuery.data));

  if (detailsQuery.isLoading && !selectedFlight) {
    return (
      <PageContainer title="Booking summary">
        <PageLoader label="Loading booking summary…" />
      </PageContainer>
    );
  }

  if (!hasBookingContext) {
    return (
      <PageContainer title="Booking summary">
        <EmptyState
          title="No booking in progress"
          message="Search for a flight and complete the booking steps before reviewing your summary."
          action={
            <AppButton
              component={RouterLink}
              to={APP_ROUTES.customer.flights}
              variant="contained"
            >
              Search flights
            </AppButton>
          }
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Booking summary"
      description="Review your trip details, then confirm before payment."
      action={
        <AppButton component={RouterLink} to={editHrefs.addons} variant="outlined">
          Add-ons
        </AppButton>
      }
    >
      <BookingSummary editHrefs={editHrefs} />
    </PageContainer>
  );
}
