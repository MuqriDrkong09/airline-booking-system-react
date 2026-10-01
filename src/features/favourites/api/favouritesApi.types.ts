import type { FlightOffer } from '@/features/flights';
import type { FavouriteFlight } from '../types/favourite';

export interface FavouritesApi {
  listFavourites: () => Promise<FavouriteFlight[]>;
  addFavourite: (flight: FlightOffer) => Promise<FavouriteFlight>;
  removeFavourite: (flightId: string) => Promise<void>;
  isFavourite: (flightId: string) => Promise<boolean>;
}
