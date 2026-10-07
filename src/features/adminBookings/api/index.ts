import { adminApi } from '@/services/adminApi';
import type {
  AdminBooking,
  AdminBookingListQuery,
  AdminBookingListResult,
  AdminBookingModifyInput,
} from '../types/adminBooking';
import type { AdminBookingsApi } from './adminBookingsApi.types';

export const adminBookingsApi: AdminBookingsApi = adminApi.bookings;

export const adminBookingKeys = {
  all: ['admin-bookings'] as const,
  lists: () => [...adminBookingKeys.all, 'list'] as const,
  list: (query?: AdminBookingListQuery) =>
    [...adminBookingKeys.lists(), query ?? {}] as const,
  details: () => [...adminBookingKeys.all, 'detail'] as const,
  detail: (reference: string) => [...adminBookingKeys.details(), reference] as const,
  flightOptions: () => [...adminBookingKeys.all, 'flight-options'] as const,
};

export function listAdminBookings(
  query?: AdminBookingListQuery,
): Promise<AdminBookingListResult> {
  return adminBookingsApi.listBookings(query);
}

export function getAdminBooking(reference: string): Promise<AdminBooking> {
  return adminBookingsApi.getBooking(reference);
}

export function cancelAdminBooking(reference: string): Promise<AdminBooking> {
  return adminBookingsApi.cancelBooking(reference);
}

export function refundAdminBooking(reference: string): Promise<AdminBooking> {
  return adminBookingsApi.refundBooking(reference);
}

export function modifyAdminBooking(
  reference: string,
  input: AdminBookingModifyInput,
): Promise<AdminBooking> {
  return adminBookingsApi.modifyBooking(reference, input);
}

export function listAdminBookingFlightOptions(): Promise<string[]> {
  return adminBookingsApi.listFlightOptions();
}

export type { AdminBookingsApi } from './adminBookingsApi.types';
export { createHttpAdminBookingsApi } from './httpAdminBookingsApi';
export { createMockAdminBookingsApi, mockAdminBookingsApi } from './mockAdminBookingsApi';
export { createSeedAdminBookings } from './adminBookingsData';
