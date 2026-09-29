import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { todayIsoDate } from '@/features/flights/utils/dates';
import type {
  Booking,
  BookingCancellationInfo,
  BookingRecordStatus,
  BookingReference,
} from '../types/bookingRecord';
import { canCheckInBooking } from '../utils/bookingStatus';
import {
  calculateCancellationQuote,
  canCancelBooking,
} from '../utils/cancellationQuote';

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
  /**
   * Runs the cancellation pipeline:
   * CANCELLATION_REQUESTED → CANCELLED or REFUNDED (with fee/refund snapshot).
   */
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
        const todayIso = todayIsoDate();
        const current = get().getBookingByReference(reference);
        if (!current || !canCancelBooking(current, todayIso)) {
          return undefined;
        }

        const quote = calculateCancellationQuote(current);
        const now = new Date().toISOString();
        const cancellation: BookingCancellationInfo = {
          requestedAt: now,
          processedAt: now,
          fee: quote.cancellationFee,
          refundAmount: quote.refundAmount,
          currency: quote.currency,
          policySummary: quote.policySummary,
          finalStatus: quote.finalStatus,
        };

        // Persist requested state first, then final outcome (mock synchronous processing).
        get().updateBooking(reference, (booking) =>
          patchBooking(booking, { status: 'CANCELLATION_REQUESTED', cancellation }, now),
        );

        return get().updateBooking(reference, (booking) =>
          patchBooking(
            booking,
            {
              status: quote.finalStatus,
              cancellation,
            },
            now,
          ),
        );
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
