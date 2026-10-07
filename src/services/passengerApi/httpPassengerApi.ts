import type { AxiosInstance } from 'axios';
import type { PassengerDraft } from '@/features/passengers/types/passenger';
import { API_ENDPOINTS, apiClient, toApiError } from '@/services/api';
import type { PassengerApi } from './types';

/**
 * Passenger profile HTTP client for a future backend sync.
 * Checkout still keeps passenger drafts in feature-local state.
 */
export function createHttpPassengerApi(client: AxiosInstance = apiClient): PassengerApi {
  return {
    async listPassengers(): Promise<PassengerDraft[]> {
      try {
        const { data } = await client.get<PassengerDraft[]>(API_ENDPOINTS.passengers.root);
        return data;
      } catch (error) {
        throw toApiError(error);
      }
    },

    async getPassenger(passengerId: string): Promise<PassengerDraft> {
      try {
        const { data } = await client.get<PassengerDraft>(
          API_ENDPOINTS.passengers.byId(passengerId),
        );
        return data;
      } catch (error) {
        throw toApiError(error);
      }
    },

    async savePassengers(passengers: PassengerDraft[]): Promise<PassengerDraft[]> {
      try {
        const { data } = await client.put<PassengerDraft[]>(API_ENDPOINTS.passengers.root, {
          passengers,
        });
        return data;
      } catch (error) {
        throw toApiError(error);
      }
    },

    async deletePassenger(passengerId: string): Promise<void> {
      try {
        await client.delete(API_ENDPOINTS.passengers.byId(passengerId));
      } catch (error) {
        throw toApiError(error);
      }
    },
  };
}
