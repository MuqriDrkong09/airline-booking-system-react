import type { Booking, BookingRecordStatus } from '@/features/booking';

/** Admin list uses the shared Booking domain model. */
export type AdminBooking = Booking;

export type AdminBookingSortField =
  | 'reference'
  | 'status'
  | 'departure'
  | 'createdAt'
  | 'total'
  | 'flight';

export type AdminBookingSortDirection = 'asc' | 'desc';

/**
 * Server-side list query for admin bookings.
 * All filter/sort/page fields are sent as query parameters over HTTP.
 */
export interface AdminBookingListQuery {
  search: string;
  status: '' | BookingRecordStatus;
  /** Inclusive departure date filter `YYYY-MM-DD`. */
  dateFrom: string;
  /** Inclusive departure date filter `YYYY-MM-DD`. */
  dateTo: string;
  /** Flight number filter (e.g. MH1). */
  flight: string;
  sortBy: AdminBookingSortField;
  sortDir: AdminBookingSortDirection;
  /** 1-based page index. */
  page: number;
  pageSize: number;
}

export interface AdminBookingListResult {
  items: AdminBooking[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

export interface AdminBookingModifyInput {
  contactEmail?: string;
  contactPhone?: string;
}

export const ADMIN_BOOKING_PAGE_SIZE = 10;

export const EMPTY_ADMIN_BOOKING_QUERY: AdminBookingListQuery = {
  search: '',
  status: '',
  dateFrom: '',
  dateTo: '',
  flight: '',
  sortBy: 'createdAt',
  sortDir: 'desc',
  page: 1,
  pageSize: ADMIN_BOOKING_PAGE_SIZE,
};
