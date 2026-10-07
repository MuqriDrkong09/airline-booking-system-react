import type { Airport, AirportSearchParams } from '../types';
import type { FlightOffer, FlightSearchRequest, FlightSearchResponse } from '../types/flight';
import type {
  FlightStatusLookupRequest,
  FlightStatusRecord,
} from '../types/flightStatus';
import { airportApi } from '@/services/airportApi';
import { flightApi, flightStatusApi as flightStatusDomainApi } from '@/services/flightApi';

export const airportsApi = airportApi;
export const flightsApi = flightApi;
export const flightStatusApi = flightStatusDomainApi;
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
  details: () => [...flightKeys.all, 'detail'] as const,
  detail: (flightId: string, context?: Partial<FlightSearchRequest> | null) =>
    [...flightKeys.details(), flightId, context ?? null] as const,
};

export const flightStatusKeys = {
  all: ['flight-status'] as const,
  lookups: () => [...flightStatusKeys.all, 'lookup'] as const,
  lookup: (request: FlightStatusLookupRequest) =>
    [...flightStatusKeys.lookups(), request] as const,
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

export function getFlightById(
  flightId: string,
  context?: Partial<FlightSearchRequest> | null,
): Promise<FlightOffer | null> {
  return flightsApi.getFlightById(flightId, context);
}

export function lookupFlightStatus(
  request: FlightStatusLookupRequest,
): Promise<FlightStatusRecord | null> {
  return flightStatusApi.lookupFlightStatus(request);
}

export type { AirportsApi } from './airportsApi.types';
export type { FlightsApi } from './flightsApi.types';
export type { FlightStatusApi } from './flightStatusApi.types';
export { createMockAirportsApi, mockAirportsApi } from './mockAirportsApi';
export { createHttpAirportsApi } from './httpAirportsApi';
export { createMockFlightsApi, mockFlightsApi } from './mockFlightsApi';
export { createHttpFlightsApi } from './httpFlightsApi';
export { createMockFlightStatusApi, mockFlightStatusApi } from './mockFlightStatusApi';
export { createHttpFlightStatusApi } from './httpFlightStatusApi';
export { MOCK_AIRPORTS } from './airportsData';
export { findMockFlightOfferById, generateMockFlightOffers } from './flightsData';
export {
  generateMockFlightStatus,
  isValidFlightNumber,
  normalizeFlightNumber,
  resolveOperationalStatus,
} from './flightStatusData';
