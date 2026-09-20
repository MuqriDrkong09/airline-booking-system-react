import { env } from '@/config/env';
import type { Airport, AirportSearchParams } from '../types';
import type { FlightSearchRequest, FlightSearchResponse } from '../types/flight';
import type { AirportsApi } from './airportsApi.types';
import type { FlightsApi } from './flightsApi.types';
import { createHttpAirportsApi } from './httpAirportsApi';
import { createHttpFlightsApi } from './httpFlightsApi';
import { mockAirportsApi } from './mockAirportsApi';
import { mockFlightsApi } from './mockFlightsApi';

export const airportsApi: AirportsApi = env.useMockAuth
  ? mockAirportsApi
  : createHttpAirportsApi();

export const flightsApi: FlightsApi = env.useMockAuth ? mockFlightsApi : createHttpFlightsApi();

export const airportKeys = {
  all: ['airports'] as const,
  lists: () => [...airportKeys.all, 'list'] as const,
  list: (params: Pick<AirportSearchParams, 'activeOnly'> = {}) =>
    [...airportKeys.lists(), params] as const,
  details: () => [...airportKeys.all, 'detail'] as const,
  detail: (code: string) => [...airportKeys.details(), code.toUpperCase()] as const,
  searches: () => [...airportKeys.all, 'search'] as const,
  search: (params: AirportSearchParams) => [...airportKeys.searches(), params] as const,
};

export const flightKeys = {
  all: ['flights'] as const,
  searches: () => [...flightKeys.all, 'search'] as const,
  search: (request: FlightSearchRequest) => [...flightKeys.searches(), request] as const,
};

export function getAirports(
  params?: Pick<AirportSearchParams, 'activeOnly'>,
): Promise<Airport[]> {
  return airportsApi.getAirports(params);
}

export function getAirportByCode(code: string): Promise<Airport | null> {
  return airportsApi.getAirportByCode(code);
}

export function searchAirports(params: AirportSearchParams): Promise<Airport[]> {
  return airportsApi.searchAirports(params);
}

export function searchFlights(request: FlightSearchRequest): Promise<FlightSearchResponse> {
  return flightsApi.searchFlights(request);
}

export type { AirportsApi } from './airportsApi.types';
export type { FlightsApi } from './flightsApi.types';
export { createMockAirportsApi, mockAirportsApi } from './mockAirportsApi';
export { createHttpAirportsApi } from './httpAirportsApi';
export { createMockFlightsApi, mockFlightsApi } from './mockFlightsApi';
export { createHttpFlightsApi } from './httpFlightsApi';
export { MOCK_AIRPORTS } from './airportsData';
export { generateMockFlightOffers } from './flightsData';
