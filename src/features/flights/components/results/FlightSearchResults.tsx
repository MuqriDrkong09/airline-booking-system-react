import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { SlidersHorizontal, X } from 'lucide-react';
import {
  memo,
  useCallback,
  useDeferredValue,
  useMemo,
  useState,
} from 'react';
import { AppBadge, AppButton, EmptyState, ErrorState, LoadingSpinner } from '@/components/common';
import { useFlightFilters } from '../../hooks/useFlightFilters';
import { useSearchFlightsQuery } from '../../hooks/useFlights';
import type { FlightOffer, FlightSearchRequest } from '../../types/flight';
import {
  filterFlightOffers,
  getAirlineOptions,
  getCabinOptions,
  getFilterBounds,
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
    <Stack spacing={1.75} aria-hidden="true" sx={{ width: '100%' }}>
      {[0, 1, 2].map((item) => (
        <Skeleton key={item} variant="rounded" height={280} />
      ))}
    </Stack>
  );
}

const MemoFlightList = memo(FlightList);

function FlightSearchResultsComponent({
  request,
  enabled = true,
  onSelectFlight,
}: FlightSearchResultsProps) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'), { defaultMatches: true });
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const query = useSearchFlightsQuery(request, { enabled });
  const flights = query.data?.flights ?? [];

  const bounds = useMemo(() => getFilterBounds(flights), [flights]);
  const airlineOptions = useMemo(() => getAirlineOptions(flights), [flights]);
  const cabinOptions = useMemo(() => getCabinOptions(flights), [flights]);

  const {
    filters,
    sort,
    activeFilterCount,
    setFilters,
    setSort,
    clearFilters,
  } = useFlightFilters(bounds);

  const deferredFilters = useDeferredValue(filters);
  const deferredSort = useDeferredValue(sort);

  const visibleFlights = useMemo(
    () => sortFlightOffers(filterFlightOffers(flights, deferredFilters), deferredSort),
    [deferredFilters, deferredSort, flights],
  );

  const handleSelectFlight = useCallback(
    (flight: FlightOffer) => {
      onSelectFlight?.(flight);
    },
    [onSelectFlight],
  );

  const openMobileFilters = useCallback(() => setMobileFiltersOpen(true), []);
  const closeMobileFilters = useCallback(() => setMobileFiltersOpen(false), []);

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

  const filterPanel = (
    <FlightFilters
      value={filters}
      airlineOptions={airlineOptions}
      cabinOptions={cabinOptions}
      bounds={bounds}
      currency={query.data?.currency}
      activeFilterCount={activeFilterCount}
      onChange={setFilters}
      onClear={clearFilters}
      embedded={!isDesktop}
    />
  );

  return (
    <Box component="section" aria-label="Flight search results">
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2.5}
        sx={{ alignItems: { md: 'flex-start' } }}
      >
        {isDesktop ? (
          <Box
            component="aside"
            aria-label="Flight filters"
            sx={{
              width: 300,
              flexShrink: 0,
              position: 'sticky',
              top: 16,
              maxHeight: 'calc(100vh - 32px)',
              overflow: 'auto',
            }}
          >
            {filterPanel}
          </Box>
        ) : null}

        <Stack spacing={2} sx={{ flex: 1, minWidth: 0, width: '100%' }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between' }}
          >
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 700 }}>
                Available flights
              </Typography>
              {activeFilterCount > 0 ? (
                <AppBadge
                  label={`${activeFilterCount} active filter${activeFilterCount === 1 ? '' : 's'}`}
                  tone="primary"
                  size="small"
                />
              ) : null}
            </Stack>

            <Stack
              direction="row"
              spacing={isDesktop ? 1 : undefined}
              useFlexGap={!isDesktop}
              sx={
                isDesktop
                  ? { alignItems: 'center', flexWrap: 'wrap' }
                  : {
                      alignItems: 'flex-end',
                      flexWrap: 'wrap',
                      columnGap: 1.5,
                      rowGap: 2,
                      width: '100%',
                    }
              }
            >
              {!isDesktop ? (
                <AppButton
                  variant="outlined"
                  startIcon={<SlidersHorizontal aria-hidden="true" size={16} />}
                  onClick={openMobileFilters}
                  aria-haspopup="dialog"
                  aria-expanded={mobileFiltersOpen}
                >
                  Filters
                  {activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
                </AppButton>
              ) : null}
              <FlightSort
                value={sort}
                onChange={setSort}
                fullWidth={isDesktop}
              />
            </Stack>
          </Stack>

          {visibleFlights.length === 0 ? (
            <EmptyState
              title="No flights match your filters"
              message="Clear or adjust filters to see more results."
              action={
                <AppButton variant="contained" onClick={clearFilters}>
                  Clear filters
                </AppButton>
              }
            />
          ) : (
            <MemoFlightList flights={visibleFlights} onSelectFlight={handleSelectFlight} />
          )}
        </Stack>
      </Stack>

      <Drawer
        anchor="bottom"
        open={!isDesktop && mobileFiltersOpen}
        onClose={closeMobileFilters}
        ModalProps={{ keepMounted: true }}
        slotProps={{
          paper: {
            sx: {
              maxHeight: '88vh',
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              p: 2,
            },
          },
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1 }}
        >
          <Typography variant="h6" component="h2" id="mobile-filters-title">
            Filters
          </Typography>
          <IconButton aria-label="Close filters" onClick={closeMobileFilters}>
            <X aria-hidden="true" size={18} />
          </IconButton>
        </Stack>
        <Box
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobile-filters-title"
          sx={{ overflow: 'auto', pb: 1 }}
        >
          {filterPanel}
          <AppButton
            variant="contained"
            fullWidth
            onClick={closeMobileFilters}
            sx={{ mt: 2 }}
          >
            Show results
          </AppButton>
        </Box>
      </Drawer>
    </Box>
  );
}

export const FlightSearchResults = memo(FlightSearchResultsComponent);
