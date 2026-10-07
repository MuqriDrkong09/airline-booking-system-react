import type { AxiosInstance } from 'axios';
import { API_ENDPOINTS, apiClient } from '@/services/api';
import type {
  AdminAircraft,
  AdminAircraftFilters,
  AdminAircraftInput,
} from '../types/adminAircraft';
import type { AdminAircraftApi } from './adminAircraftApi.types';

function toQuery(filters?: AdminAircraftFilters): Record<string, string> | undefined {
  if (!filters) {
    return undefined;
  }

  const params: Record<string, string> = {};
  if (filters.search.trim()) params.search = filters.search.trim();
  if (filters.manufacturer) params.manufacturer = filters.manufacturer;
  if (filters.active) params.active = filters.active;
  return Object.keys(params).length > 0 ? params : undefined;
}

export function createHttpAdminAircraftApi(client: AxiosInstance = apiClient): AdminAircraftApi {
  return {
    async listAircraft(filters?: AdminAircraftFilters): Promise<AdminAircraft[]> {
      const { data } = await client.get<AdminAircraft[]>(API_ENDPOINTS.admin.aircraft, {
        params: toQuery(filters),
      });
      return data;
    },
    async getAircraft(aircraftId: string): Promise<AdminAircraft> {
      const { data } = await client.get<AdminAircraft>(
        API_ENDPOINTS.admin.aircraftById(aircraftId),
      );
      return data;
    },
    async createAircraft(input: AdminAircraftInput): Promise<AdminAircraft> {
      const { data } = await client.post<AdminAircraft>(API_ENDPOINTS.admin.aircraft, input);
      return data;
    },
    async updateAircraft(aircraftId: string, input: AdminAircraftInput): Promise<AdminAircraft> {
      const { data } = await client.put<AdminAircraft>(
        API_ENDPOINTS.admin.aircraftById(aircraftId),
        input,
      );
      return data;
    },
    async setAircraftActive(aircraftId: string, active: boolean): Promise<AdminAircraft> {
      const { data } = await client.patch<AdminAircraft>(
        API_ENDPOINTS.admin.aircraftActive(aircraftId),
        { active },
      );
      return data;
    },
    async deleteAircraft(aircraftId: string): Promise<void> {
      await client.delete(API_ENDPOINTS.admin.aircraftById(aircraftId));
    },
  };
}
