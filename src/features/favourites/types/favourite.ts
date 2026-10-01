import type { FlightOffer } from '@/features/flights';

export interface FavouriteFlight {
  id: string;
  flight: FlightOffer;
  savedAt: string;
}

export function sortFavouritesByNewest(favourites: FavouriteFlight[]): FavouriteFlight[] {
  return [...favourites].sort(
    (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime(),
  );
}
