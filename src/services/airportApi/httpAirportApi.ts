import type { AxiosInstance } from 'axios';
import type { AirportsApi } from '@/features/flights/api/airportsApi.types';
import type { Airport, AirportSearchParams } from '@/features/flights/types';
import { API_ENDPOINTS, apiClient, toApiError } from '@/services/api';

export function createHttpAirportApi(client: AxiosInstance = apiClient): AirportsApi {
  return {
    async getAirports(params = {}): Promise<Airport[]> {
      try {
        const { data } = await client.get<Airport[]>(API_ENDPOINTS.airports.root, {
          params: {
            activeOnly: params.activeOnly ?? false,
          },
        });
        return data;
      } catch (error) {
        throw toApiError(error);
      }
    },

    async getAirportByCode(code: string): Promise<Airport | null> {
      try {
        const { data } = await client.get<Airport>(API_ENDPOINTS.airports.byCode(code));
        return data;
      } catch (error) {
        const apiError = toApiError(error);
        if (apiError.status === 404) {
          return null;
        }
        throw apiError;
      }
    },

    async searchAirports(params: AirportSearchParams): Promise<Airport[]> {
      try {
        const { data } = await client.get<Airport[]>(API_ENDPOINTS.airports.search, {
          params: {
            q: params.query ?? '',
            activeOnly: params.activeOnly ?? true,
            limit: params.limit ?? 20,
          },
        });
        return data;
      } catch (error) {
        throw toApiError(error);
      }
    },
  };
}
