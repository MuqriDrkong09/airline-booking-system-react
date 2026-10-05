import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  adminBookingKeys,
  cancelAdminBooking,
  getAdminBooking,
  listAdminBookingFlightOptions,
  listAdminBookings,
  modifyAdminBooking,
  refundAdminBooking,
} from '../api';
import type {
  AdminBookingListQuery,
  AdminBookingModifyInput,
} from '../types/adminBooking';

export function useAdminBookingsQuery(query: AdminBookingListQuery, enabled = true) {
  return useQuery({
    queryKey: adminBookingKeys.list(query),
    queryFn: () => listAdminBookings(query),
    enabled,
    placeholderData: (previous) => previous,
  });
}

export function useAdminBookingDetailQuery(reference: string, enabled = true) {
  return useQuery({
    queryKey: adminBookingKeys.detail(reference),
    queryFn: () => getAdminBooking(reference),
    enabled: enabled && Boolean(reference),
  });
}

export function useAdminBookingFlightOptionsQuery(enabled = true) {
  return useQuery({
    queryKey: adminBookingKeys.flightOptions(),
    queryFn: () => listAdminBookingFlightOptions(),
    enabled,
  });
}

export function useCancelAdminBookingMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reference: string) => cancelAdminBooking(reference),
    onSuccess: async (booking) => {
      await queryClient.invalidateQueries({ queryKey: adminBookingKeys.lists() });
      queryClient.setQueryData(adminBookingKeys.detail(booking.reference), booking);
    },
  });
}

export function useRefundAdminBookingMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reference: string) => refundAdminBooking(reference),
    onSuccess: async (booking) => {
      await queryClient.invalidateQueries({ queryKey: adminBookingKeys.lists() });
      queryClient.setQueryData(adminBookingKeys.detail(booking.reference), booking);
    },
  });
}

export function useModifyAdminBookingMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      reference,
      input,
    }: {
      reference: string;
      input: AdminBookingModifyInput;
    }) => modifyAdminBooking(reference, input),
    onSuccess: async (booking) => {
      await queryClient.invalidateQueries({ queryKey: adminBookingKeys.lists() });
      queryClient.setQueryData(adminBookingKeys.detail(booking.reference), booking);
    },
  });
}
