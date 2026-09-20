import {
  startTransition,
  useCallback,
  useMemo,
} from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  DEFAULT_FLIGHT_SORT,
  isFlightSortOption,
  type FlightFilterBounds,
  type FlightFilterState,
  type FlightSortOption,
} from '../types/flight';
import {
  areFlightFiltersEqual,
  clearFlightFilterParams,
  countActiveFlightFilters,
  DEFAULT_FLIGHT_FILTERS,
  parseFlightFilterParams,
  writeFlightFilterParams,
} from '../utils/filterParams';

function parseSort(value: string | null): FlightSortOption {
  if (value && isFlightSortOption(value)) {
    return value;
  }
  return DEFAULT_FLIGHT_SORT;
}

export function useFlightFilters(bounds?: FlightFilterBounds | null) {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(
    () => parseFlightFilterParams(searchParams),
    [searchParams],
  );

  const sort = useMemo(() => parseSort(searchParams.get('sort')), [searchParams]);

  const activeFilterCount = useMemo(
    () => countActiveFlightFilters(filters, bounds ?? null),
    [bounds, filters],
  );

  const setFilters = useCallback(
    (next: FlightFilterState | ((current: FlightFilterState) => FlightFilterState)) => {
      startTransition(() => {
        setSearchParams(
          (previous) => {
            const current = parseFlightFilterParams(previous);
            const resolved = typeof next === 'function' ? next(current) : next;
            if (areFlightFiltersEqual(current, resolved)) {
              return previous;
            }
            return writeFlightFilterParams(previous, resolved, bounds ?? null);
          },
          { replace: true },
        );
      });
    },
    [bounds, setSearchParams],
  );

  const clearFilters = useCallback(() => {
    startTransition(() => {
      setSearchParams(
        (previous) => {
          const cleared = clearFlightFilterParams(previous);
          const sortValue = previous.get('sort');
          if (sortValue) {
            cleared.set('sort', sortValue);
          }
          return cleared;
        },
        { replace: true },
      );
    });
  }, [setSearchParams]);

  const setSort = useCallback(
    (next: FlightSortOption) => {
      startTransition(() => {
        setSearchParams(
          (previous) => {
            const params = new URLSearchParams(previous);
            if (next === DEFAULT_FLIGHT_SORT) {
              params.delete('sort');
            } else {
              params.set('sort', next);
            }
            return params;
          },
          { replace: true },
        );
      });
    },
    [setSearchParams],
  );

  const resetFiltersToDefaults = useCallback(() => {
    setFilters({ ...DEFAULT_FLIGHT_FILTERS });
  }, [setFilters]);

  return {
    filters,
    sort,
    activeFilterCount,
    setFilters,
    setSort,
    clearFilters,
    resetFiltersToDefaults,
  };
}
