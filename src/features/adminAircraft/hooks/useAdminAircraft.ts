import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  adminAircraftKeys,
  createAdminAircraft,
  deleteAdminAircraft,
  getAdminAircraft,
  listAdminAircraft,
  setAdminAircraftActive,
  updateAdminAircraft,
} from '../api';
import type { AdminAircraftFilters, AdminAircraftInput } from '../types/adminAircraft';

export function useAdminAircraftQuery(filters: AdminAircraftFilters, enabled = true) {
  return useQuery({
    queryKey: adminAircraftKeys.list(filters),
    queryFn: () => listAdminAircraft(filters),
    enabled,
  });
}

export function useAdminAircraftDetailQuery(aircraftId: string, enabled = true) {
  return useQuery({
    queryKey: adminAircraftKeys.detail(aircraftId),
    queryFn: () => getAdminAircraft(aircraftId),
    enabled: enabled && Boolean(aircraftId),
  });
}

export function useCreateAdminAircraftMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AdminAircraftInput) => createAdminAircraft(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: adminAircraftKeys.lists() });
    },
  });
}

export function useUpdateAdminAircraftMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      aircraftId,
      input,
    }: {
      aircraftId: string;
      input: AdminAircraftInput;
    }) => updateAdminAircraft(aircraftId, input),
    onSuccess: async (aircraft) => {
      await queryClient.invalidateQueries({ queryKey: adminAircraftKeys.lists() });
      queryClient.setQueryData(adminAircraftKeys.detail(aircraft.id), aircraft);
    },
  });
}

export function useSetAdminAircraftActiveMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ aircraftId, active }: { aircraftId: string; active: boolean }) =>
      setAdminAircraftActive(aircraftId, active),
    onSuccess: async (aircraft) => {
      await queryClient.invalidateQueries({ queryKey: adminAircraftKeys.lists() });
      queryClient.setQueryData(adminAircraftKeys.detail(aircraft.id), aircraft);
    },
  });
}

export function useDeleteAdminAircraftMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (aircraftId: string) => deleteAdminAircraft(aircraftId),
    onSuccess: async (_void, aircraftId) => {
      await queryClient.invalidateQueries({ queryKey: adminAircraftKeys.lists() });
      queryClient.removeQueries({ queryKey: adminAircraftKeys.detail(aircraftId) });
    },
  });
}
