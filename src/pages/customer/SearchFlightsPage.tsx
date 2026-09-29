import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppAlert, PageContainer, PageLoader } from '@/components/common';
import { APP_ROUTES } from '@/constants/routes';
import {
  buildBookingAfterFlightChange,
  calculateFlightChangeQuote,
  CHANGE_BOOKING_QUERY,
  FlightChangeConfirmDialog,
  useBookingsStore,
} from '@/features/booking';
import {
  criteriaFromFormValues,
  FlightSearchForm,
  FlightSearchResults,
  formatSearchSummary,
  isCompleteFlightSearchRequest,
  parseFlightSearchParams,
  serializeFlightSearchCriteria,
  useFlightSearchHydration,
  type FlightOffer,
  type FlightSearchFormValues,
  type FlightSearchRequest,
} from '@/features/flights';

function toSearchRequest(
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

export function SearchFlightsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { defaultValues, isHydrating, hydrationKey, parsedCriteria } =
    useFlightSearchHydration(searchParams);
  const [searchSummary, setSearchSummary] = useState<string | null>(null);
  const [pendingFlight, setPendingFlight] = useState<FlightOffer | null>(null);
  const [changeError, setChangeError] = useState<string | null>(null);
  const [applyingChange, setApplyingChange] = useState(false);

  const changeBookingReference = searchParams.get(CHANGE_BOOKING_QUERY)?.trim() || '';
  const existingBooking = useBookingsStore((state) =>
    changeBookingReference
      ? state.bookings.find((item) => item.reference === changeBookingReference)
      : undefined,
  );
  const saveBooking = useBookingsStore((state) => state.saveBooking);

  const searchRequest = useMemo(() => toSearchRequest(parsedCriteria), [parsedCriteria]);
  const canSearch = isCompleteFlightSearchRequest(searchRequest);

  const changeQuote =
    existingBooking && pendingFlight
      ? calculateFlightChangeQuote(existingBooking, pendingFlight)
      : null;

  const initialSummary = useMemo(() => {
    if (!parsedCriteria || isHydrating || !canSearch) {
      return null;
    }

    const hasRoute =
      parsedCriteria.tripType === 'MULTI_CITY'
        ? Boolean(parsedCriteria.legs?.length) &&
          defaultValues.legs.every((leg) => leg.origin && leg.destination)
        : Boolean(defaultValues.origin && defaultValues.destination && defaultValues.departureDate);

    if (!hasRoute) {
      return null;
    }

    return formatSearchSummary(defaultValues);
  }, [canSearch, defaultValues, isHydrating, parsedCriteria]);

  const handleSearch = (values: FlightSearchFormValues) => {
    const next = serializeFlightSearchCriteria(criteriaFromFormValues(values));
    if (changeBookingReference) {
      next.set(CHANGE_BOOKING_QUERY, changeBookingReference);
    }
    setSearchParams(next, { replace: true });
    setSearchSummary(formatSearchSummary(values));
  };

  const handleSelectFlight = (flight: FlightOffer) => {
    if (changeBookingReference) {
      if (!existingBooking) {
        setChangeError(
          `Booking ${changeBookingReference} was not found. Open Manage booking and try again.`,
        );
        return;
      }
      setChangeError(null);
      setPendingFlight(flight);
      return;
    }

    navigate({
      pathname: APP_ROUTES.customer.flightDetails(flight.id),
      search: searchParams.toString(),
    });
  };

  const handleConfirmFlightChange = () => {
    if (!existingBooking || !pendingFlight) {
      return;
    }
    setApplyingChange(true);
    try {
      const next = buildBookingAfterFlightChange(existingBooking, pendingFlight);
      saveBooking(next);
      setPendingFlight(null);
      navigate(APP_ROUTES.customer.bookingManage(next.reference));
    } finally {
      setApplyingChange(false);
    }
  };

  const summary = searchSummary ?? initialSummary;

  return (
    <PageContainer
      title={changeBookingReference ? 'Change flight' : 'Search flights'}
      description={
        changeBookingReference
          ? `Select a replacement flight for booking ${changeBookingReference}. You’ll confirm fare difference and change fee before applying.`
          : 'Choose trip type, airports, dates, passengers, and cabin class. Your search is saved in the URL so you can share or bookmark it.'
      }
    >
      <Stack spacing={3} sx={{ maxWidth: 1100 }}>
        {changeBookingReference ? (
          <AppAlert severity="info" title="Flight change mode">
            You are changing booking <strong>{changeBookingReference}</strong>
            {existingBooking
              ? ` (${existingBooking.flight.origin.code} → ${existingBooking.flight.destination.code}).`
              : '.'}{' '}
            Choosing a flight opens a confirmation with fare and fee details.
          </AppAlert>
        ) : null}

        {changeError ? (
          <AppAlert severity="error" title="Cannot change flight" onClose={() => setChangeError(null)}>
            {changeError}
          </AppAlert>
        ) : null}

        {isHydrating ? (
          <PageLoader label="Loading search criteria…" />
        ) : (
          <FlightSearchForm
            key={hydrationKey}
            defaultValues={defaultValues}
            formKey={hydrationKey}
            onSearch={handleSearch}
          />
        )}

        {summary ? (
          <AppAlert severity="info" title="Search criteria">
            {summary}
          </AppAlert>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Try a shared link like{' '}
            <strong>
              /app/flights?from=KUL&to=NRT&departure=2026-10-20&return=2026-10-27&adults=2&cabin=ECONOMY
            </strong>
            , or search for airports such as <strong>KUL</strong>, <strong>Singapore</strong>, or{' '}
            <strong>Tokyo</strong>.
          </Typography>
        )}

        {canSearch ? (
          <FlightSearchResults
            request={searchRequest}
            enabled={!isHydrating}
            onSelectFlight={handleSelectFlight}
          />
        ) : null}
      </Stack>

      {existingBooking && pendingFlight && changeQuote ? (
        <FlightChangeConfirmDialog
          open
          bookingReference={existingBooking.reference}
          currentFlight={existingBooking.flight}
          newFlight={pendingFlight}
          quote={changeQuote}
          loading={applyingChange}
          onConfirm={handleConfirmFlightChange}
          onCancel={() => setPendingFlight(null)}
        />
      ) : null}
    </PageContainer>
  );
}
