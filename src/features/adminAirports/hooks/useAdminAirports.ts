import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  adminAirportKeys,
  createAdminAirport,
  deleteAdminAirport,
  listAdminAirports,
  setAdminAirportActive,
  updateAdminAirport,
} from '../api';
import type { AdminAirportFilters, AdminAirportInput } from '../types/adminAirport';

export function useAdminAirportsQuery(filters: AdminAirportFilters, enabled = true) {
  return useQuery({
    queryKey: adminAirportKeys.list(filters),
    queryFn: () => listAdminAirports(filters),
    enabled,
  });
}

export function useCreateAdminAirportMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AdminAirportInput) => createAdminAirport(input),
    onSuccess: () => {
      // Do not await — dialog close / UI should not block on list refetch.
      void queryClient.invalidateQueries({ queryKey: adminAirportKeys.lists() });
    },
  });
}

export function useUpdateAdminAirportMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      airportId,
      input,
    }: {
      airportId: string;
      input: AdminAirportInput;
    }) => updateAdminAirport(airportId, input),
    onSuccess: (airport) => {
      queryClient.setQueryData(adminAirportKeys.detail(airport.id), airport);
      void queryClient.invalidateQueries({ queryKey: adminAirportKeys.lists() });
    },
  });
}

export function useSetAdminAirportActiveMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ airportId, active }: { airportId: string; active: boolean }) =>
      setAdminAirportActive(airportId, active),
    onSuccess: (airport) => {
      queryClient.setQueryData(adminAirportKeys.detail(airport.id), airport);
      void queryClient.invalidateQueries({ queryKey: adminAirportKeys.lists() });
    },
  });
}

export function useDeleteAdminAirportMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (airportId: string) => deleteAdminAirport(airportId),
    onSuccess: (_void, airportId) => {
      queryClient.removeQueries({ queryKey: adminAirportKeys.detail(airportId) });
      void queryClient.invalidateQueries({ queryKey: adminAirportKeys.lists() });
    },
  });
}
