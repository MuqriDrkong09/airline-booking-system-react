import { env } from '@/config/env';
import type { Airport, AirportSearchParams } from '../types';
import type { AirportsApi } from './airportsApi.types';
import { createHttpAirportsApi } from './httpAirportsApi';
import { mockAirportsApi } from './mockAirportsApi';

export const airportsApi: AirportsApi = env.useMockAuth
  ? mockAirportsApi
  : createHttpAirportsApi();

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

export type { AirportsApi } from './airportsApi.types';
export { createMockAirportsApi, mockAirportsApi } from './mockAirportsApi';
export { createHttpAirportsApi } from './httpAirportsApi';
export { MOCK_AIRPORTS } from './airportsData';
