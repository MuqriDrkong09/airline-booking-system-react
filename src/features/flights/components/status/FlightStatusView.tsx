import Stack from '@mui/material/Stack';
import { Plane } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  AppAlert,
  EmptyState,
  ErrorState,
  PageLoader,
} from '@/components/common';
import { isValidCalendarDate, todayIsoDate } from '../../utils/dates';
import {
  isCompleteFlightStatusRequest,
  useFlightStatusQuery,
} from '../../hooks/useFlightStatus';
import { normalizeFlightNumber } from '../../api/flightStatusData';
import { FlightStatusLookupForm } from './FlightStatusLookupForm';
import { FlightStatusResult } from './FlightStatusResult';

export function FlightStatusView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [submitted, setSubmitted] = useState(false);

  const initialFlightNumber = searchParams.get('flightNumber')?.trim() ?? '';
  const initialDateParam = searchParams.get('date')?.trim() ?? '';
  const initialDate = isValidCalendarDate(initialDateParam)
    ? initialDateParam
    : todayIsoDate();

  const [lookup, setLookup] = useState(() => {
    const flightNumber = normalizeFlightNumber(initialFlightNumber);
    const date = initialDate;
    if (isCompleteFlightStatusRequest({ flightNumber, date })) {
      return { flightNumber, date };
    }
    return null;
  });

  const queryEnabled = submitted || lookup !== null;

  const query = useFlightStatusQuery(lookup, { enabled: queryEnabled && lookup !== null });

  const errorMessage = useMemo(() => {
    if (!query.isError) {
      return null;
    }
    if (query.error instanceof Error && query.error.message.trim()) {
      return query.error.message;
    }
    return 'Unable to look up flight status right now. Please try again.';
  }, [query.error, query.isError]);

  const handleSubmit = (values: { flightNumber: string; date: string }) => {
    setSubmitted(true);
    setLookup(values);
    setSearchParams(
      {
        flightNumber: values.flightNumber,
        date: values.date,
      },
      { replace: true },
    );
  };

  return (
    <Stack spacing={2.5} sx={{ width: '100%' }}>
      <FlightStatusLookupForm
        initialFlightNumber={lookup?.flightNumber ?? initialFlightNumber}
        initialDate={lookup?.date ?? initialDate}
        loading={query.isFetching}
        onSubmit={handleSubmit}
      />

      {query.isFetching ? <PageLoader label="Looking up flight status…" /> : null}

      {errorMessage ? (
        <ErrorState
          title="Status lookup failed"
          message={errorMessage}
          onRetry={() => {
            void query.refetch();
          }}
        />
      ) : null}

      {!query.isFetching && !query.isError && queryEnabled && lookup && query.data === null ? (
        <EmptyState
          icon={<Plane aria-hidden size={40} />}
          title="No flight found"
          message={`We could not find ${lookup.flightNumber} on ${lookup.date}. Check the flight number and date, then try again.`}
        />
      ) : null}

      {!query.isFetching && !query.isError && query.data ? (
        <Stack spacing={1.5}>
          <AppAlert severity="info" title="Demo operational data">
            Status times are simulated for this demo and refresh when you search again.
          </AppAlert>
          <FlightStatusResult status={query.data} />
        </Stack>
      ) : null}
    </Stack>
  );
}
