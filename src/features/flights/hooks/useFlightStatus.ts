import { useQuery } from '@tanstack/react-query';
import { flightStatusKeys, lookupFlightStatus } from '../api';
import type { FlightStatusLookupRequest } from '../types/flightStatus';
import {
  isValidFlightNumber,
  normalizeFlightNumber,
} from '../api/flightStatusData';
import { isValidCalendarDate } from '../utils/dates';

export function isCompleteFlightStatusRequest(
  request: Partial<FlightStatusLookupRequest> | null | undefined,
): request is FlightStatusLookupRequest {
  if (!request) {
    return false;
  }
  const flightNumber = request.flightNumber?.trim() ?? '';
  const date = request.date?.trim() ?? '';
  return isValidFlightNumber(flightNumber) && isValidCalendarDate(date);
}

export function useFlightStatusQuery(
  request: Partial<FlightStatusLookupRequest> | null | undefined,
  options: { enabled?: boolean } = {},
) {
  const enabled =
    (options.enabled ?? true) && isCompleteFlightStatusRequest(request);

  const normalized: FlightStatusLookupRequest | null = enabled
    ? {
        flightNumber: normalizeFlightNumber(request.flightNumber),
        date: request.date.trim(),
      }
    : null;

  return useQuery({
    queryKey: normalized
      ? flightStatusKeys.lookup(normalized)
      : ([...flightStatusKeys.lookups(), 'idle'] as const),
    queryFn: () => lookupFlightStatus(normalized!),
    enabled,
    retry: false,
  });
}
