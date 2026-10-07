import type { Booking } from '@/features/booking/types/bookingRecord';

export interface BookingListQuery {
  status?: Booking['status'];
  page?: number;
  pageSize?: number;
}

export interface BookingListResult {
  items: Booking[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateBookingPayload {
  booking: Booking;
}

export interface CheckInPayload {
  passengerIds: string[];
}

export interface BookingApi {
  listBookings(query?: BookingListQuery): Promise<BookingListResult>;
  getBooking(reference: string): Promise<Booking>;
  createBooking(payload: CreateBookingPayload): Promise<Booking>;
  cancelBooking(reference: string): Promise<Booking>;
  checkInBooking(reference: string, payload: CheckInPayload): Promise<Booking>;
}
