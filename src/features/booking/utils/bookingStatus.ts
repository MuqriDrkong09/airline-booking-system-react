import type { Booking, BookingRecordStatus } from '../types/bookingRecord';

export const BOOKING_STATUS_TONE: Record<
  BookingRecordStatus,
  'default' | 'info' | 'success' | 'warning' | 'error'
> = {
  PENDING: 'warning',
  CONFIRMED: 'success',
  CANCELLED: 'error',
  CHECKED_IN: 'info',
  COMPLETED: 'default',
  REFUNDED: 'warning',
};

export const BOOKING_STATUS_LABELS: Record<BookingRecordStatus, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  CANCELLED: 'Cancelled',
  CHECKED_IN: 'Checked in',
  COMPLETED: 'Completed',
  REFUNDED: 'Refunded',
};

export type MyBookingsTab = 'upcoming' | 'past' | 'cancelled';

export const MY_BOOKINGS_TABS: readonly {
  id: MyBookingsTab;
  label: string;
}[] = [
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'past', label: 'Past' },
  { id: 'cancelled', label: 'Cancelled' },
] as const;

export function getBookingDepartureDate(booking: Booking): string {
  const raw = booking.flight.departureTime;
  return raw.includes('T') ? (raw.split('T')[0] ?? raw) : raw;
}

export function isCancelledBooking(booking: Booking): boolean {
  return booking.status === 'CANCELLED' || booking.status === 'REFUNDED';
}

export function getBookingTab(booking: Booking, todayIso: string): MyBookingsTab {
  if (isCancelledBooking(booking)) {
    return 'cancelled';
  }

  const departureDate = getBookingDepartureDate(booking);
  return departureDate >= todayIso ? 'upcoming' : 'past';
}

export function canCancelBooking(booking: Booking): boolean {
  return booking.status === 'PENDING' || booking.status === 'CONFIRMED';
}

export function canCheckInBooking(booking: Booking, todayIso: string): boolean {
  return booking.status === 'CONFIRMED' && getBookingTab(booking, todayIso) === 'upcoming';
}

export function canManageBooking(booking: Booking): boolean {
  return !isCancelledBooking(booking);
}

export function canDownloadTicket(booking: Booking): boolean {
  return (
    booking.status === 'CONFIRMED' ||
    booking.status === 'CHECKED_IN' ||
    booking.status === 'COMPLETED' ||
    booking.status === 'PENDING'
  );
}
