import { env } from '@/config/env';
import type { FlightOperationalStatus } from '@/features/flights';
import type {
  AdminFlight,
  AdminFlightFilters,
  AdminFlightInput,
} from '../types/adminFlight';
import type { AdminFlightsApi } from './adminFlightsApi.types';
import { createHttpAdminFlightsApi } from './httpAdminFlightsApi';
import { mockAdminFlightsApi } from './mockAdminFlightsApi';

export const adminFlightsApi: AdminFlightsApi = env.useMockAuth
  ? mockAdminFlightsApi
  : createHttpAdminFlightsApi();

export const adminFlightKeys = {
  all: ['admin-flights'] as const,
  lists: () => [...adminFlightKeys.all, 'list'] as const,
  list: (filters?: AdminFlightFilters) =>
    [...adminFlightKeys.lists(), filters ?? {}] as const,
  details: () => [...adminFlightKeys.all, 'detail'] as const,
  detail: (flightId: string) => [...adminFlightKeys.details(), flightId] as const,
};

export function listAdminFlights(filters?: AdminFlightFilters): Promise<AdminFlight[]> {
  return adminFlightsApi.listFlights(filters);
}

export function getAdminFlight(flightId: string): Promise<AdminFlight> {
  return adminFlightsApi.getFlight(flightId);
}

export function createAdminFlight(input: AdminFlightInput): Promise<AdminFlight> {
  return adminFlightsApi.createFlight(input);
}

export function updateAdminFlight(
  flightId: string,
  input: AdminFlightInput,
): Promise<AdminFlight> {
  return adminFlightsApi.updateFlight(flightId, input);
}

export function updateAdminFlightStatus(
  flightId: string,
  status: FlightOperationalStatus,
): Promise<AdminFlight> {
  return adminFlightsApi.updateFlightStatus(flightId, status);
}

export function deleteAdminFlight(flightId: string): Promise<void> {
  return adminFlightsApi.deleteFlight(flightId);
}

export type { AdminFlightsApi } from './adminFlightsApi.types';
export { createHttpAdminFlightsApi } from './httpAdminFlightsApi';
export { createMockAdminFlightsApi, mockAdminFlightsApi } from './mockAdminFlightsApi';
export { createSeedAdminFlights } from './adminFlightsData';
