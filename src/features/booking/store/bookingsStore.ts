import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { todayIsoDate } from '@/features/flights/utils/dates';
import type {
  Booking,
  BookingCancellationInfo,
  BookingRecordStatus,
  BookingReference,
} from '../types/bookingRecord';
import {
  calculateCancellationQuote,
  canCancelBooking,
} from '../utils/cancellationQuote';
import {
  canCheckInBooking,
  getCheckedInPassengerIds,
  getEligibleCheckInPassengers,
  isPassengerCheckedIn,
} from '../utils/checkInRules';

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
  /**
   * Checks in the given passengers (or all remaining eligible passengers).
   * Sets booking status to CHECKED_IN.
   */
  checkInBooking: (
    reference: BookingReference,
    passengerIds?: string[],
  ) => Booking | undefined;
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
          return {
            bookings: [
              {
                ...booking,
                checkedInPassengerIds: booking.checkedInPassengerIds ?? [],
              },
              ...without,
            ],
          };
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

      checkInBooking: (reference, passengerIds) => {
        const current = get().getBookingByReference(reference);
        if (!current || !canCheckInBooking(current)) {
          return undefined;
        }

        const eligible = getEligibleCheckInPassengers(current);
        const requested =
          passengerIds && passengerIds.length > 0
            ? passengerIds.filter((id) =>
                eligible.some((passenger) => passenger.id === id),
              )
            : eligible.map((passenger) => passenger.id);

        if (requested.length === 0) {
          return undefined;
        }

        if (requested.some((id) => isPassengerCheckedIn(current, id))) {
          return undefined;
        }

        const merged = Array.from(
          new Set([...getCheckedInPassengerIds(current), ...requested]),
        );

        return get().updateBooking(reference, (booking) =>
          patchBooking(booking, {
            status: 'CHECKED_IN',
            checkedInPassengerIds: merged,
          }),
        );
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
      merge: (persisted, current) => {
        const persistedState = persisted as Partial<BookingsState> | undefined;
        const bookings = (persistedState?.bookings ?? current.bookings).map((booking) => ({
          ...booking,
          checkedInPassengerIds: booking.checkedInPassengerIds ?? [],
        }));
        return {
          ...current,
          ...persistedState,
          bookings,
        };
      },
    },
  ),
);
