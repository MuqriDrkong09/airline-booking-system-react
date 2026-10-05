import type {
  AdminBooking,
  AdminBookingListQuery,
  AdminBookingListResult,
  AdminBookingModifyInput,
} from '../types/adminBooking';

export interface AdminBookingsApi {
  listBookings: (query?: AdminBookingListQuery) => Promise<AdminBookingListResult>;
  getBooking: (reference: string) => Promise<AdminBooking>;
  cancelBooking: (reference: string) => Promise<AdminBooking>;
  refundBooking: (reference: string) => Promise<AdminBooking>;
  modifyBooking: (
    reference: string,
    input: AdminBookingModifyInput,
  ) => Promise<AdminBooking>;
  listFlightOptions: () => Promise<string[]>;
}
