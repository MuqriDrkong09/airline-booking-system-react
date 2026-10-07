import type { AxiosInstance } from 'axios';
import type { FlightOffer } from '@/features/flights';
import { API_ENDPOINTS, apiClient } from '@/services/api';
import type { FavouriteFlight } from '../types/favourite';
import type { FavouritesApi } from './favouritesApi.types';

export function createHttpFavouritesApi(client: AxiosInstance = apiClient): FavouritesApi {
  return {
    async listFavourites(): Promise<FavouriteFlight[]> {
      const { data } = await client.get<FavouriteFlight[]>(API_ENDPOINTS.favourites.root);
      return data;
    },

    async addFavourite(flight: FlightOffer): Promise<FavouriteFlight> {
      const { data } = await client.post<FavouriteFlight>(API_ENDPOINTS.favourites.root, {
        flight,
      });
      return data;
    },

    async removeFavourite(flightId: string): Promise<void> {
      await client.delete(API_ENDPOINTS.favourites.byFlightId(flightId));
    },

    async isFavourite(flightId: string): Promise<boolean> {
      const { data } = await client.get<{ favourite: boolean }>(
        API_ENDPOINTS.favourites.status(flightId),
      );
      return data.favourite;
    },
  };
}
