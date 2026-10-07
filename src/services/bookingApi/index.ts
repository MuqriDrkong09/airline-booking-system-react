import { createHttpBookingApi } from './httpBookingApi';

/**
 * Domain service: customer bookings.
 * Always HTTP — customer booking persistence is still local/mock in the feature layer today.
 */
export const bookingApi = createHttpBookingApi();

export { createHttpBookingApi } from './httpBookingApi';
export type {
  BookingApi,
  BookingListQuery,
  BookingListResult,
  CheckInPayload,
  CreateBookingPayload,
} from './types';
