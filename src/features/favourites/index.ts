export type { FavouriteFlight } from './types/favourite';
export { sortFavouritesByNewest } from './types/favourite';
export {
  favouriteKeys,
  favouritesApi,
  listFavourites,
  addFavourite,
  removeFavourite,
  isFavourite,
  createHttpFavouritesApi,
  createMockFavouritesApi,
  mockFavouritesApi,
} from './api';
export type { FavouritesApi } from './api';
export {
  useFavouritesQuery,
  useIsFavouriteQuery,
  useAddFavouriteMutation,
  useRemoveFavouriteMutation,
  useToggleFavourite,
} from './hooks/useFavourites';
export { FavouriteButton } from './components/FavouriteButton';
export type { FavouriteButtonProps } from './components/FavouriteButton';
export { FavouriteFlightCard } from './components/FavouriteFlightCard';
export type { FavouriteFlightCardProps } from './components/FavouriteFlightCard';
export { FavouritesView } from './components/FavouritesView';
