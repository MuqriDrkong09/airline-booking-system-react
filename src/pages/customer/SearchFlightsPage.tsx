import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AppAlert, PageContainer, PageLoader } from '@/components/common';
import {
  criteriaFromFormValues,
  FlightSearchForm,
  formatSearchSummary,
  serializeFlightSearchCriteria,
  useFlightSearchHydration,
  type FlightSearchFormValues,
} from '@/features/flights';

export function SearchFlightsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { defaultValues, isHydrating, hydrationKey, parsedCriteria } =
    useFlightSearchHydration(searchParams);
  const [searchSummary, setSearchSummary] = useState<string | null>(null);

  const initialSummary = useMemo(() => {
    if (!parsedCriteria || isHydrating) {
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
  }, [defaultValues, isHydrating, parsedCriteria]);

  const handleSearch = (values: FlightSearchFormValues) => {
    const criteria = criteriaFromFormValues(values);
    setSearchParams(serializeFlightSearchCriteria(criteria), { replace: true });
    setSearchSummary(formatSearchSummary(values));
  };

  const summary = searchSummary ?? initialSummary;

  return (
    <PageContainer
      title="Search flights"
      description="Choose trip type, airports, dates, passengers, and cabin class. Your search is saved in the URL so you can share or bookmark it."
    >
      <Stack spacing={3} sx={{ maxWidth: 960 }}>
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
            {summary}. Flight results will appear here in a later update.
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
      </Stack>
    </PageContainer>
  );
}
