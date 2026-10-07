import { adminApi } from '@/services/adminApi';
import type {
  AdminAirport,
  AdminAirportFilters,
  AdminAirportInput,
} from '../types/adminAirport';
import type { AdminAirportsApi } from './adminAirportsApi.types';

export const adminAirportsApi: AdminAirportsApi = adminApi.airports;

export const adminAirportKeys = {
  all: ['admin-airports'] as const,
  lists: () => [...adminAirportKeys.all, 'list'] as const,
  list: (filters?: AdminAirportFilters) =>
    [...adminAirportKeys.lists(), filters ?? {}] as const,
  details: () => [...adminAirportKeys.all, 'detail'] as const,
  detail: (airportId: string) => [...adminAirportKeys.details(), airportId] as const,
};

export function listAdminAirports(filters?: AdminAirportFilters): Promise<AdminAirport[]> {
  return adminAirportsApi.listAirports(filters);
}

export function getAdminAirport(airportId: string): Promise<AdminAirport> {
  return adminAirportsApi.getAirport(airportId);
}

export function createAdminAirport(input: AdminAirportInput): Promise<AdminAirport> {
  return adminAirportsApi.createAirport(input);
}

export function updateAdminAirport(
  airportId: string,
  input: AdminAirportInput,
): Promise<AdminAirport> {
  return adminAirportsApi.updateAirport(airportId, input);
}

export function setAdminAirportActive(
  airportId: string,
  active: boolean,
): Promise<AdminAirport> {
  return adminAirportsApi.setAirportActive(airportId, active);
}

export function deleteAdminAirport(airportId: string): Promise<void> {
  return adminAirportsApi.deleteAirport(airportId);
}

export type { AdminAirportsApi } from './adminAirportsApi.types';
export { createHttpAdminAirportsApi } from './httpAdminAirportsApi';
export { createMockAdminAirportsApi, mockAdminAirportsApi } from './mockAdminAirportsApi';
export { createSeedAdminAirports } from './adminAirportsData';
