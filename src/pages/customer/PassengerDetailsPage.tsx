import Stack from '@mui/material/Stack';
import { useEffect, useMemo } from 'react';
import { Link as RouterLink, useParams, useSearchParams } from 'react-router-dom';
import { AppButton, EmptyState, PageContainer } from '@/components/common';
import { APP_ROUTES } from '@/constants/routes';
import { parseFlightSearchParams } from '@/features/flights';
import {
  isInternationalFlight,
  PassengerForm,
  usePassengerDraftStore,
} from '@/features/passengers';

export function PassengerDetailsPage() {
  const { flightId = '' } = useParams<{ flightId: string }>();
  const [searchParams] = useSearchParams();
  const initTrip = usePassengerDraftStore((state) => state.initTrip);

  const parsed = useMemo(() => parseFlightSearchParams(searchParams), [searchParams]);

  const from = (
    parsed?.tripType === 'MULTI_CITY' ? parsed.legs?.[0]?.from : parsed?.from
  )
    ?.trim()
    .toUpperCase();
  const to = (parsed?.tripType === 'MULTI_CITY' ? parsed.legs?.[0]?.to : parsed?.to)
    ?.trim()
    .toUpperCase();
  const departure =
    parsed?.tripType === 'MULTI_CITY'
      ? parsed.legs?.[0]?.departure
      : parsed?.departure;

  const counts = {
    adults: parsed?.adults ?? 1,
    children: parsed?.children ?? 0,
    infants: parsed?.infants ?? 0,
  };

  const requiresPassport = Boolean(from && to && isInternationalFlight(from, to));
  const canShowForm = Boolean(flightId && from && to && departure);

  const detailsHref = flightId
    ? `${APP_ROUTES.customer.flightDetails(flightId)}${
        searchParams.toString() ? `?${searchParams.toString()}` : ''
      }`
    : APP_ROUTES.customer.flights;

  const resultsHref = `${APP_ROUTES.customer.flights}${
    searchParams.toString() ? `?${searchParams.toString()}` : ''
  }`;

  useEffect(() => {
    if (!canShowForm || !from || !to || !departure) {
      return;
    }
    initTrip({
      flightId,
      from,
      to,
      departure,
      counts,
      requiresPassport,
    });
  }, [
    canShowForm,
    counts.adults,
    counts.children,
    counts.infants,
    departure,
    flightId,
    from,
    initTrip,
    requiresPassport,
    to,
  ]);

  if (!canShowForm) {
    return (
      <PageContainer title="Passenger details">
        <EmptyState
          title="Missing trip details"
          message="Open a flight from search results, then select it to enter passenger information."
          action={
            <AppButton component={RouterLink} to={APP_ROUTES.customer.flights} variant="contained">
              Search flights
            </AppButton>
          }
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Passenger details"
      description={`${from} → ${to} · ${departure} · enter traveler information matching your search.`}
      action={
        <Stack direction="row" spacing={1}>
          <AppButton component={RouterLink} to={detailsHref} variant="outlined">
            Back to flight
          </AppButton>
          <AppButton component={RouterLink} to={resultsHref} variant="text">
            Results
          </AppButton>
        </Stack>
      }
    >
      <Stack spacing={2.5} sx={{ maxWidth: 900 }}>
        <PassengerForm
          counts={counts}
          departureDate={departure!}
          requiresPassport={requiresPassport}
        />
      </Stack>
    </PageContainer>
  );
}
