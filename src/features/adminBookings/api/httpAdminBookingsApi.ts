import type { AxiosInstance } from 'axios';
import { apiClient } from '@/services/api/client';
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

export function createHttpAdminBookingsApi(
  client: AxiosInstance = apiClient,
): AdminBookingsApi {
  return {
    async listBookings(query?: AdminBookingListQuery): Promise<AdminBookingListResult> {
      const { data } = await client.get<AdminBookingListResult>('/admin/bookings', {
        params: toQuery(query ?? EMPTY_ADMIN_BOOKING_QUERY),
      });
      return data;
    },
    async getBooking(reference: string): Promise<AdminBooking> {
      const { data } = await client.get<AdminBooking>(
        `/admin/bookings/${encodeURIComponent(reference)}`,
      );
      return data;
    },
    async cancelBooking(reference: string): Promise<AdminBooking> {
      const { data } = await client.post<AdminBooking>(
        `/admin/bookings/${encodeURIComponent(reference)}/cancel`,
      );
      return data;
    },
    async refundBooking(reference: string): Promise<AdminBooking> {
      const { data } = await client.post<AdminBooking>(
        `/admin/bookings/${encodeURIComponent(reference)}/refund`,
      );
      return data;
    },
    async modifyBooking(
      reference: string,
      input: AdminBookingModifyInput,
    ): Promise<AdminBooking> {
      const { data } = await client.patch<AdminBooking>(
        `/admin/bookings/${encodeURIComponent(reference)}`,
        input,
      );
      return data;
    },
    async listFlightOptions(): Promise<string[]> {
      const { data } = await client.get<string[]>('/admin/bookings/flight-options');
      return data;
    },
  };
}
