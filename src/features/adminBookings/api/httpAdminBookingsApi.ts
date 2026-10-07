import type { AxiosInstance } from 'axios';
import { API_ENDPOINTS, apiClient } from '@/services/api';
import type {
  AdminBooking,
  AdminBookingListQuery,
  AdminBookingListResult,
  AdminBookingModifyInput,
} from '../types/adminBooking';
import { EMPTY_ADMIN_BOOKING_QUERY } from '../types/adminBooking';
import type { AdminBookingsApi } from './adminBookingsApi.types';

function toQuery(query: AdminBookingListQuery): Record<string, string> {
  const params: Record<string, string> = {
    page: String(query.page),
    pageSize: String(query.pageSize),
    sortBy: query.sortBy,
    sortDir: query.sortDir,
  };

  if (query.search.trim()) params.search = query.search.trim();
  if (query.status) params.status = query.status;
  if (query.dateFrom) params.dateFrom = query.dateFrom;
  if (query.dateTo) params.dateTo = query.dateTo;
  if (query.flight.trim()) params.flight = query.flight.trim();

  return params;
}

export function createHttpAdminBookingsApi(client: AxiosInstance = apiClient): AdminBookingsApi {
  return {
    async listBookings(query?: AdminBookingListQuery): Promise<AdminBookingListResult> {
      const { data } = await client.get<AdminBookingListResult>(API_ENDPOINTS.admin.bookings, {
        params: toQuery(query ?? EMPTY_ADMIN_BOOKING_QUERY),
      });
      return data;
    },
    async getBooking(reference: string): Promise<AdminBooking> {
      const { data } = await client.get<AdminBooking>(
        API_ENDPOINTS.admin.bookingByReference(reference),
      );
      return data;
    },
    async cancelBooking(reference: string): Promise<AdminBooking> {
      const { data } = await client.post<AdminBooking>(
        API_ENDPOINTS.admin.bookingCancel(reference),
      );
      return data;
    },
    async refundBooking(reference: string): Promise<AdminBooking> {
      const { data } = await client.post<AdminBooking>(
        API_ENDPOINTS.admin.bookingRefund(reference),
      );
      return data;
    },
    async modifyBooking(reference: string, input: AdminBookingModifyInput): Promise<AdminBooking> {
      const { data } = await client.patch<AdminBooking>(
        API_ENDPOINTS.admin.bookingByReference(reference),
        input,
      );
      return data;
    },
    async listFlightOptions(): Promise<string[]> {
      const { data } = await client.get<string[]>(API_ENDPOINTS.admin.bookingFlightOptions);
      return data;
    },
  };
}
