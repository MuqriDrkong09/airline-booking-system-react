import type { AxiosInstance } from 'axios';
import type { FlightOperationalStatus } from '@/features/flights';
import { apiClient } from '@/services/api/client';
import type {
  AdminFlight,
  AdminFlightFilters,
  AdminFlightInput,
} from '../types/adminFlight';
import type { AdminFlightsApi } from './adminFlightsApi.types';

function toQuery(filters?: AdminFlightFilters): Record<string, string> | undefined {
  if (!filters) {
    return undefined;
  }

  const params: Record<string, string> = {};
  if (filters.search.trim()) params.search = filters.search.trim();
  if (filters.airline) params.airline = filters.airline;
  if (filters.origin) params.origin = filters.origin;
  if (filters.destination) params.destination = filters.destination;
  if (filters.status) params.status = filters.status;
  return Object.keys(params).length > 0 ? params : undefined;
}

export function createHttpAdminFlightsApi(
  client: AxiosInstance = apiClient,
): AdminFlightsApi {
  return {
    async listFlights(filters?: AdminFlightFilters): Promise<AdminFlight[]> {
      const { data } = await client.get<AdminFlight[]>('/admin/flights', {
        params: toQuery(filters),
      });
      return data;
    },
    async getFlight(flightId: string): Promise<AdminFlight> {
      const { data } = await client.get<AdminFlight>(
        `/admin/flights/${encodeURIComponent(flightId)}`,
      );
      return data;
    },
    async createFlight(input: AdminFlightInput): Promise<AdminFlight> {
      const { data } = await client.post<AdminFlight>('/admin/flights', input);
      return data;
    },
    async updateFlight(flightId: string, input: AdminFlightInput): Promise<AdminFlight> {
      const { data } = await client.put<AdminFlight>(
        `/admin/flights/${encodeURIComponent(flightId)}`,
        input,
      );
      return data;
    },
    async updateFlightStatus(
      flightId: string,
      status: FlightOperationalStatus,
    ): Promise<AdminFlight> {
      const { data } = await client.patch<AdminFlight>(
        `/admin/flights/${encodeURIComponent(flightId)}/status`,
        { status },
      );
      return data;
    },
    async deleteFlight(flightId: string): Promise<void> {
      await client.delete(`/admin/flights/${encodeURIComponent(flightId)}`);
    },
  };
}
