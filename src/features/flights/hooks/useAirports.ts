import { useQuery } from '@tanstack/react-query';
import {
  airportKeys,
  getAirportByCode,
  getAirports,
  searchAirports,
} from '../api';
import type { AirportSearchParams } from '../types';

export function useAirportsQuery(params: Pick<AirportSearchParams, 'activeOnly'> = {}) {
  return useQuery({
    queryKey: airportKeys.list(params),
    queryFn: () => getAirports(params),
  });
}

export function useAirportByCodeQuery(code: string, enabled = true) {
  const normalizedCode = code.trim();

  return useQuery({
    queryKey: airportKeys.detail(normalizedCode),
    queryFn: () => getAirportByCode(normalizedCode),
    enabled: enabled && normalizedCode.length > 0,
  });
}

export function useSearchAirportsQuery(
  params: AirportSearchParams,
  options: { enabled?: boolean } = {},
) {
  const searchParams: AirportSearchParams = {
    query: params.query?.trim() ?? '',
    activeOnly: params.activeOnly ?? true,
    limit: params.limit ?? 20,
  };

  return useQuery({
    queryKey: airportKeys.search(searchParams),
    queryFn: () => searchAirports(searchParams),
    enabled: options.enabled ?? true,
    placeholderData: (previous) => previous,
  });
}
