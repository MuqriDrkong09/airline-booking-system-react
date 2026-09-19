import type { AxiosInstance } from 'axios';
import { apiClient } from '@/services/api/client';
import type { Airport, AirportSearchParams } from '../types';
import type { AirportsApi } from './airportsApi.types';

export function createHttpAirportsApi(client: AxiosInstance = apiClient): AirportsApi {
  return {
    async getAirports(params = {}): Promise<Airport[]> {
      const { data } = await client.get<Airport[]>('/airports', {
        params: {
          activeOnly: params.activeOnly ?? false,
        },
      });
      return data;
    },

    async getAirportByCode(code: string): Promise<Airport | null> {
      try {
        const { data } = await client.get<Airport>(`/airports/${encodeURIComponent(code)}`);
        return data;
      } catch (error) {
        if (
          typeof error === 'object' &&
          error !== null &&
          'response' in error &&
          typeof (error as { response?: { status?: number } }).response?.status === 'number' &&
          (error as { response: { status: number } }).response.status === 404
        ) {
          return null;
        }
        throw error;
      }
    },

    async searchAirports(params: AirportSearchParams): Promise<Airport[]> {
      const { data } = await client.get<Airport[]>('/airports/search', {
        params: {
          q: params.query ?? '',
          activeOnly: params.activeOnly ?? true,
          limit: params.limit ?? 20,
        },
      });
      return data;
    },
  };
}
