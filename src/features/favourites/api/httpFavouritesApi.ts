import type { AxiosInstance } from 'axios';
import type { FlightOffer } from '@/features/flights';
import { apiClient } from '@/services/api/client';
import type { FavouriteFlight } from '../types/favourite';
import type { FavouritesApi } from './favouritesApi.types';

export function createHttpFavouritesApi(client: AxiosInstance = apiClient): FavouritesApi {
  return {
    async listFavourites(): Promise<FavouriteFlight[]> {
      const { data } = await client.get<FavouriteFlight[]>('/favourites');
      return data;
    },

    async addFavourite(flight: FlightOffer): Promise<FavouriteFlight> {
      const { data } = await client.post<FavouriteFlight>('/favourites', { flight });
      return data;
    },

    async removeFavourite(flightId: string): Promise<void> {
      await client.delete(`/favourites/${encodeURIComponent(flightId)}`);
    },

    async isFavourite(flightId: string): Promise<boolean> {
      const { data } = await client.get<{ favourite: boolean }>(
        `/favourites/${encodeURIComponent(flightId)}/status`,
      );
      return data.favourite;
    },
  };
}
