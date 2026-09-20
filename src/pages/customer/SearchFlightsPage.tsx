import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AppAlert, PageContainer, PageLoader } from '@/components/common';
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
  const [searchParams, setSearchParams] = useSearchParams();
  const { defaultValues, isHydrating, hydrationKey, parsedCriteria } =
    useFlightSearchHydration(searchParams);
  const [searchSummary, setSearchSummary] = useState<string | null>(null);
  const [selectedFlight, setSelectedFlight] = useState<FlightOffer | null>(null);

  const searchRequest = useMemo(() => toSearchRequest(parsedCriteria), [parsedCriteria]);
  const canSearch = isCompleteFlightSearchRequest(searchRequest);

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
    const criteria = criteriaFromFormValues(values);
    setSelectedFlight(null);
    setSearchParams(serializeFlightSearchCriteria(criteria), { replace: true });
    setSearchSummary(formatSearchSummary(values));
  };

  const summary = searchSummary ?? initialSummary;

  return (
    <PageContainer
      title="Search flights"
      description="Choose trip type, airports, dates, passengers, and cabin class. Your search is saved in the URL so you can share or bookmark it."
    >
      <Stack spacing={3} sx={{ maxWidth: 1100 }}>
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
            onSelectFlight={setSelectedFlight}
          />
        ) : null}

        {selectedFlight ? (
          <AppAlert severity="success" title="Flight selected">
            {selectedFlight.airline.name} {selectedFlight.flightNumber} ·{' '}
            {selectedFlight.origin.code} → {selectedFlight.destination.code}. Booking flow will be
            added in a later update.
          </AppAlert>
        ) : null}
      </Stack>
    </PageContainer>
  );
}
