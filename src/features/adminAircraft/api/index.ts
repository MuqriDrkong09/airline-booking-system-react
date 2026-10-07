import { adminApi } from '@/services/adminApi';
import type {
  AdminAircraft,
  AdminAircraftFilters,
  AdminAircraftInput,
} from '../types/adminAircraft';
import type { AdminAircraftApi } from './adminAircraftApi.types';

export const adminAircraftApi: AdminAircraftApi = adminApi.aircraft;

export const adminAircraftKeys = {
  all: ['admin-aircraft'] as const,
  lists: () => [...adminAircraftKeys.all, 'list'] as const,
  list: (filters?: AdminAircraftFilters) =>
    [...adminAircraftKeys.lists(), filters ?? {}] as const,
  details: () => [...adminAircraftKeys.all, 'detail'] as const,
  detail: (aircraftId: string) => [...adminAircraftKeys.details(), aircraftId] as const,
};

export function listAdminAircraft(filters?: AdminAircraftFilters): Promise<AdminAircraft[]> {
  return adminAircraftApi.listAircraft(filters);
}

export function getAdminAircraft(aircraftId: string): Promise<AdminAircraft> {
  return adminAircraftApi.getAircraft(aircraftId);
}

export function createAdminAircraft(input: AdminAircraftInput): Promise<AdminAircraft> {
  return adminAircraftApi.createAircraft(input);
}

export function updateAdminAircraft(
  aircraftId: string,
  input: AdminAircraftInput,
): Promise<AdminAircraft> {
  return adminAircraftApi.updateAircraft(aircraftId, input);
}

export function setAdminAircraftActive(
  aircraftId: string,
  active: boolean,
): Promise<AdminAircraft> {
  return adminAircraftApi.setAircraftActive(aircraftId, active);
}

export function deleteAdminAircraft(aircraftId: string): Promise<void> {
  return adminAircraftApi.deleteAircraft(aircraftId);
}

export type { AdminAircraftApi } from './adminAircraftApi.types';
export { createHttpAdminAircraftApi } from './httpAdminAircraftApi';
export { createMockAdminAircraftApi, mockAdminAircraftApi } from './mockAdminAircraftApi';
export { createSeedAdminAircraft } from './adminAircraftData';
