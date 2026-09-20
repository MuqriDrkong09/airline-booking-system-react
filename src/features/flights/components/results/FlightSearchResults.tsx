import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useEffect, useMemo, useState } from 'react';
import { EmptyState, ErrorState, LoadingSpinner } from '@/components/common';
import { useSearchFlightsQuery } from '../../hooks/useFlights';
import type {
  FlightFilterState,
  FlightOffer,
  FlightSearchRequest,
  FlightSortOption,
} from '../../types/flight';
import {
  DEFAULT_FLIGHT_FILTERS,
  filterFlightOffers,
  getAirlineOptions,
  getMaxPriceCeiling,
  sortFlightOffers,
} from '../../utils/flightResults';
import { FlightFilters } from './FlightFilters';
import { FlightList } from './FlightList';
import { FlightSort } from './FlightSort';

export interface FlightSearchResultsProps {
  request: Partial<FlightSearchRequest> | null;
  enabled?: boolean;
  onSelectFlight?: (flight: FlightOffer) => void;
}

function ResultsSkeleton() {
  return (
    <Stack
      spacing={1.75}
      aria-hidden="true"
      sx={{ width: '100%' }}
    >
      {[0, 1, 2].map((item) => (
        <Skeleton key={item} variant="rounded" height={280} />
      ))}
    </Stack>
  );
}

export function FlightSearchResults({
  request,
  enabled = true,
  onSelectFlight,
}: FlightSearchResultsProps) {
  const query = useSearchFlightsQuery(request, { enabled });
  const [filters, setFilters] = useState<FlightFilterState>(DEFAULT_FLIGHT_FILTERS);
  const [sort, setSort] = useState<FlightSortOption>('price_asc');

  const flights = query.data?.flights ?? [];
  const airlineOptions = useMemo(() => getAirlineOptions(flights), [flights]);
  const maxPriceCeiling = useMemo(() => getMaxPriceCeiling(flights), [flights]);

  useEffect(() => {
    setFilters(DEFAULT_FLIGHT_FILTERS);
    setSort('price_asc');
  }, [request?.from, request?.to, request?.departure, request?.cabinClass]);

  const visibleFlights = useMemo(
    () => sortFlightOffers(filterFlightOffers(flights, filters), sort),
    [filters, flights, sort],
  );

  if (!enabled || !request) {
    return null;
  }

  if (query.isLoading) {
    return (
      <Stack spacing={2} component="section" aria-label="Flight search results">
        <LoadingSpinner centered label="Searching flights…" />
        <ResultsSkeleton />
      </Stack>
    );
  }

  if (query.isError) {
    const message =
      query.error instanceof Error
        ? query.error.message
        : 'Unable to load flight results. Please try again.';

    return (
      <ErrorState
        title="Flight search failed"
        message={message}
        onRetry={() => {
          void query.refetch();
        }}
      />
    );
  }

  if (flights.length === 0) {
    return (
      <EmptyState
        title="No flights found"
        message="Try different airports, dates, or cabin class to see available options."
      />
    );
  }

  return (
    <Box component="section" aria-label="Flight search results">
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2.5}
        sx={{ alignItems: { md: 'flex-start' } }}
      >
        <Box
          sx={{
            width: { xs: '100%', md: 280 },
            flexShrink: 0,
            position: { md: 'sticky' },
            top: { md: 16 },
          }}
        >
          <FlightFilters
            value={filters}
            airlineOptions={airlineOptions}
            maxPriceCeiling={maxPriceCeiling}
            currency={query.data?.currency}
            onChange={setFilters}
          />
        </Box>

        <Stack spacing={2} sx={{ flex: 1, minWidth: 0, width: '100%' }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between' }}
          >
            <Typography variant="h6" component="h2" sx={{ fontWeight: 700 }}>
              Available flights
            </Typography>
            <FlightSort value={sort} onChange={setSort} />
          </Stack>

          {visibleFlights.length === 0 ? (
            <EmptyState
              title="No flights match your filters"
              message="Clear or adjust filters to see more results."
            />
          ) : (
            <FlightList flights={visibleFlights} onSelectFlight={onSelectFlight} />
          )}
        </Stack>
      </Stack>
    </Box>
  );
}
