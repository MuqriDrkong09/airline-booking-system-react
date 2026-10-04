import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { FlightOperationalStatus } from '@/features/flights';
import {
  adminFlightKeys,
  createAdminFlight,
  deleteAdminFlight,
  listAdminFlights,
  updateAdminFlight,
  updateAdminFlightStatus,
} from '../api';
import type { AdminFlightFilters, AdminFlightInput } from '../types/adminFlight';

export function useAdminFlightsQuery(filters: AdminFlightFilters, enabled = true) {
  return useQuery({
    queryKey: adminFlightKeys.list(filters),
    queryFn: () => listAdminFlights(filters),
    enabled,
  });
}

export function useCreateAdminFlightMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AdminFlightInput) => createAdminFlight(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: adminFlightKeys.lists() });
    },
  });
}

export function useUpdateAdminFlightMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ flightId, input }: { flightId: string; input: AdminFlightInput }) =>
      updateAdminFlight(flightId, input),
    onSuccess: async (flight) => {
      await queryClient.invalidateQueries({ queryKey: adminFlightKeys.lists() });
      queryClient.setQueryData(adminFlightKeys.detail(flight.id), flight);
    },
  });
}

export function useUpdateAdminFlightStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      flightId,
      status,
    }: {
      flightId: string;
      status: FlightOperationalStatus;
    }) => updateAdminFlightStatus(flightId, status),
    onSuccess: async (flight) => {
      await queryClient.invalidateQueries({ queryKey: adminFlightKeys.lists() });
      queryClient.setQueryData(adminFlightKeys.detail(flight.id), flight);
    },
  });
}

export function useDeleteAdminFlightMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (flightId: string) => deleteAdminFlight(flightId),
    onSuccess: async (_void, flightId) => {
      await queryClient.invalidateQueries({ queryKey: adminFlightKeys.lists() });
      queryClient.removeQueries({ queryKey: adminFlightKeys.detail(flightId) });
    },
  });
}
