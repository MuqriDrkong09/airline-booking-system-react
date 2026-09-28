import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { todayIsoDate } from '@/features/flights/utils/dates';
import type {
  Booking,
  BookingRecordStatus,
  BookingReference,
} from '../types/bookingRecord';
import { canCancelBooking, canCheckInBooking } from '../utils/bookingStatus';

interface BookingsState {
  bookings: Booking[];
  saveBooking: (booking: Booking) => void;
  updateBooking: (
    reference: BookingReference,
    updater: (booking: Booking) => Booking,
  ) => Booking | undefined;
  updateBookingStatus: (
    reference: BookingReference,
    status: BookingRecordStatus,
  ) => Booking | undefined;
  cancelBooking: (reference: BookingReference) => Booking | undefined;
  checkInBooking: (reference: BookingReference) => Booking | undefined;
  getBookingByReference: (reference: BookingReference) => Booking | undefined;
  getBookingById: (id: string) => Booking | undefined;
  clearBookings: () => void;
}

function patchBooking(
  booking: Booking,
  patch: Partial<Booking>,
  now = new Date().toISOString(),
): Booking {
  return {
    ...booking,
    ...patch,
    updatedAt: now,
  };
}

export const useBookingsStore = create<BookingsState>()(
  persist(
    (set, get) => ({
      bookings: [],

      saveBooking: (booking) => {
        set((state) => {
          const without = state.bookings.filter(
            (item) => item.id !== booking.id && item.reference !== booking.reference,
          );
          return { bookings: [booking, ...without] };
        });
      },

      updateBooking: (reference, updater) => {
        const current = get().getBookingByReference(reference);
        if (!current) {
          return undefined;
        }

        const next = updater(current);
        get().saveBooking(next);
        return next;
      },

      updateBookingStatus: (reference, status) =>
        get().updateBooking(reference, (booking) => patchBooking(booking, { status })),

      cancelBooking: (reference) => {
        const current = get().getBookingByReference(reference);
        if (!current || !canCancelBooking(current)) {
          return undefined;
        }
        return get().updateBookingStatus(reference, 'CANCELLED');
      },

      checkInBooking: (reference) => {
        const current = get().getBookingByReference(reference);
        if (!current || !canCheckInBooking(current, todayIsoDate())) {
          return undefined;
        }
        return get().updateBookingStatus(reference, 'CHECKED_IN');
      },

      getBookingByReference: (reference) =>
        get().bookings.find((booking) => booking.reference === reference),

      getBookingById: (id) => get().bookings.find((booking) => booking.id === id),

      clearBookings: () => set({ bookings: [] }),
    }),
    {
      name: 'aerobook-bookings',
      partialize: (state) => ({
        bookings: state.bookings,
      }),
    },
  ),
);
