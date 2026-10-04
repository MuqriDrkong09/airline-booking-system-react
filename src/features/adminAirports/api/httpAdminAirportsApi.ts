import type { AxiosInstance } from 'axios';
import { apiClient } from '@/services/api/client';
import type {
  AdminAirport,
  AdminAirportFilters,
  AdminAirportInput,
} from '../types/adminAirport';
import type { AdminAirportsApi } from './adminAirportsApi.types';

function toQuery(filters?: AdminAirportFilters): Record<string, string> | undefined {
  if (!filters) {
    return undefined;
  }

  const params: Record<string, string> = {};
  if (filters.search.trim()) params.search = filters.search.trim();
  if (filters.country) params.country = filters.country;
  if (filters.active) params.active = filters.active;
  return Object.keys(params).length > 0 ? params : undefined;
}

export function createHttpAdminAirportsApi(
  client: AxiosInstance = apiClient,
): AdminAirportsApi {
  return {
    async listAirports(filters?: AdminAirportFilters): Promise<AdminAirport[]> {
      const { data } = await client.get<AdminAirport[]>('/admin/airports', {
        params: toQuery(filters),
      });
      return data;
    },
    async getAirport(airportId: string): Promise<AdminAirport> {
      const { data } = await client.get<AdminAirport>(
        `/admin/airports/${encodeURIComponent(airportId)}`,
      );
      return data;
    },
    async createAirport(input: AdminAirportInput): Promise<AdminAirport> {
      const { data } = await client.post<AdminAirport>('/admin/airports', input);
      return data;
    },
    async updateAirport(airportId: string, input: AdminAirportInput): Promise<AdminAirport> {
      const { data } = await client.put<AdminAirport>(
        `/admin/airports/${encodeURIComponent(airportId)}`,
        input,
      );
      return data;
    },
    async setAirportActive(airportId: string, active: boolean): Promise<AdminAirport> {
      const { data } = await client.patch<AdminAirport>(
        `/admin/airports/${encodeURIComponent(airportId)}/active`,
        { active },
      );
      return data;
    },
    async deleteAirport(airportId: string): Promise<void> {
      await client.delete(`/admin/airports/${encodeURIComponent(airportId)}`);
    },
  };
}
