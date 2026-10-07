import type { AxiosInstance } from 'axios';
import type { Booking } from '@/features/booking/types/bookingRecord';
import { API_ENDPOINTS, apiClient, toApiError } from '@/services/api';
import type {
  BookingApi,
  BookingListQuery,
  BookingListResult,
  CheckInPayload,
  CreateBookingPayload,
} from './types';

/**
 * Customer booking HTTP client.
 * Local booking state still uses the Zustand store until the backend is wired.
 */
export function createHttpBookingApi(client: AxiosInstance = apiClient): BookingApi {
  return {
    async listBookings(query: BookingListQuery = {}): Promise<BookingListResult> {
      try {
        const { data } = await client.get<BookingListResult>(API_ENDPOINTS.bookings.root, {
          params: query,
        });
        return data;
      } catch (error) {
        throw toApiError(error);
      }
    },

    async getBooking(reference: string): Promise<Booking> {
      try {
        const { data } = await client.get<Booking>(
          API_ENDPOINTS.bookings.byReference(reference),
        );
        return data;
      } catch (error) {
        throw toApiError(error);
      }
    },

    async createBooking(payload: CreateBookingPayload): Promise<Booking> {
      try {
        const { data } = await client.post<Booking>(API_ENDPOINTS.bookings.root, payload);
        return data;
      } catch (error) {
        throw toApiError(error);
      }
    },

    async cancelBooking(reference: string): Promise<Booking> {
      try {
        const { data } = await client.post<Booking>(API_ENDPOINTS.bookings.cancel(reference));
        return data;
      } catch (error) {
        throw toApiError(error);
      }
    },

    async checkInBooking(reference: string, payload: CheckInPayload): Promise<Booking> {
      try {
        const { data } = await client.post<Booking>(
          API_ENDPOINTS.bookings.checkIn(reference),
          payload,
        );
        return data;
      } catch (error) {
        throw toApiError(error);
      }
    },
  };
}
