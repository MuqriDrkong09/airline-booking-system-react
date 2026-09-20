import { useQuery } from '@tanstack/react-query';
import { flightKeys, getFlightById, searchFlights } from '../api';
import type { FlightSearchRequest } from '../types/flight';

export function isCompleteFlightSearchRequest(
  request: Partial<FlightSearchRequest> | null | undefined,
): request is FlightSearchRequest {
  if (!request) {
    return false;
  }

  return Boolean(
    request.from?.trim() &&
      request.to?.trim() &&
      request.departure?.trim() &&
      request.cabinClass &&
      typeof request.adults === 'number',
  );
}

export function useSearchFlightsQuery(
  request: Partial<FlightSearchRequest> | null | undefined,
  options: { enabled?: boolean } = {},
) {
  const enabled =
    (options.enabled ?? true) && isCompleteFlightSearchRequest(request);

  const normalized: FlightSearchRequest | null = enabled
    ? {
        from: request.from.trim().toUpperCase(),
        to: request.to.trim().toUpperCase(),
        departure: request.departure,
        returnDate: request.returnDate,
        adults: request.adults,
        children: request.children ?? 0,
        infants: request.infants ?? 0,
        cabinClass: request.cabinClass,
        tripType: request.tripType,
      }
    : null;

  return useQuery({
    queryKey: normalized
      ? flightKeys.search(normalized)
      : ([...flightKeys.searches(), 'idle'] as const),
    queryFn: () => searchFlights(normalized!),
    enabled,
    retry: false,
  });
}

export function useFlightDetailsQuery(
  flightId: string | null | undefined,
  context?: Partial<FlightSearchRequest> | null,
  options: { enabled?: boolean } = {},
) {
  const id = flightId?.trim() ?? '';
  const enabled = (options.enabled ?? true) && Boolean(id);

  return useQuery({
    queryKey: enabled
      ? flightKeys.detail(id, context ?? null)
      : ([...flightKeys.details(), 'idle'] as const),
    queryFn: () => getFlightById(id, context),
    enabled,
    retry: false,
  });
}
