import { useQuery } from '@tanstack/react-query';
import { flightKeys, searchFlights } from '../api';
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
