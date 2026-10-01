import { env } from '@/config/env';
import type { FlightOffer } from '@/features/flights';
import type { FavouriteFlight } from '../types/favourite';
import { createHttpFavouritesApi } from './httpFavouritesApi';
import { mockFavouritesApi } from './mockFavouritesApi';
import type { FavouritesApi } from './favouritesApi.types';

export const favouritesApi: FavouritesApi = env.useMockAuth
  ? mockFavouritesApi
  : createHttpFavouritesApi();

export const favouriteKeys = {
  all: ['favourites'] as const,
  lists: () => [...favouriteKeys.all, 'list'] as const,
  list: () => [...favouriteKeys.lists()] as const,
  status: (flightId: string) => [...favouriteKeys.all, 'status', flightId] as const,
};

export function listFavourites(): Promise<FavouriteFlight[]> {
  return favouritesApi.listFavourites();
}

export function addFavourite(flight: FlightOffer): Promise<FavouriteFlight> {
  return favouritesApi.addFavourite(flight);
}

export function removeFavourite(flightId: string): Promise<void> {
  return favouritesApi.removeFavourite(flightId);
}

export function isFavourite(flightId: string): Promise<boolean> {
  return favouritesApi.isFavourite(flightId);
}

export type { FavouritesApi } from './favouritesApi.types';
export { createHttpFavouritesApi } from './httpFavouritesApi';
export { createMockFavouritesApi, mockFavouritesApi } from './mockFavouritesApi';
