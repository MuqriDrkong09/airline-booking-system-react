import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { FlightOffer } from '@/features/flights';
import type { FavouriteFlight } from '../types/favourite';
import {
  addFavourite,
  favouriteKeys,
  isFavourite,
  listFavourites,
  removeFavourite,
} from '../api';

export function useFavouritesQuery(enabled = true) {
  return useQuery({
    queryKey: favouriteKeys.list(),
    queryFn: listFavourites,
    enabled,
  });
}

export function useIsFavouriteQuery(flightId: string, enabled = true) {
  return useQuery({
    queryKey: favouriteKeys.status(flightId),
    queryFn: () => isFavourite(flightId),
    enabled: enabled && Boolean(flightId),
  });
}

export function useAddFavouriteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (flight: FlightOffer) => addFavourite(flight),
    onSuccess: (favourite) => {
      queryClient.setQueryData<FavouriteFlight[]>(favouriteKeys.list(), (current) => {
        const existing = current ?? [];
        if (existing.some((item) => item.flight.id === favourite.flight.id)) {
          return existing;
        }
        return [favourite, ...existing];
      });
      queryClient.setQueryData(favouriteKeys.status(favourite.flight.id), true);
    },
  });
}

export function useRemoveFavouriteMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (flightId: string) => removeFavourite(flightId),
    onSuccess: (_void, flightId) => {
      queryClient.setQueryData<FavouriteFlight[]>(favouriteKeys.list(), (current) =>
        (current ?? []).filter((item) => item.flight.id !== flightId),
      );
      queryClient.setQueryData(favouriteKeys.status(flightId), false);
    },
  });
}

export function useToggleFavourite(flight: FlightOffer) {
  const statusQuery = useIsFavouriteQuery(flight.id);
  const addMutation = useAddFavouriteMutation();
  const removeMutation = useRemoveFavouriteMutation();

  const isFavouriteFlight = statusQuery.data === true;
  const isPending = addMutation.isPending || removeMutation.isPending;

  const toggle = () => {
    if (isFavouriteFlight) {
      removeMutation.mutate(flight.id);
      return;
    }
    addMutation.mutate(flight);
  };

  return {
    isFavourite: isFavouriteFlight,
    isPending,
    isLoading: statusQuery.isLoading,
    toggle,
  };
}
