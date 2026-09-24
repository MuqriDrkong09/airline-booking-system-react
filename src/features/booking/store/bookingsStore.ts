import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Booking, BookingReference } from '../types/bookingRecord';

interface BookingsState {
  bookings: Booking[];
  saveBooking: (booking: Booking) => void;
  getBookingByReference: (reference: BookingReference) => Booking | undefined;
  getBookingById: (id: string) => Booking | undefined;
  clearBookings: () => void;
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
