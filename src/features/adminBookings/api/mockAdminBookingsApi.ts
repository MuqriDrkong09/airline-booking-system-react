import { useBookingsStore } from '@/features/booking';
import type { Booking } from '@/features/booking';
import {
  applyBookingCancellation,
  applyBookingModify,
  applyBookingRefund,
  listFlightFilterOptions,
} from '../utils/adminBookingActions';
import { queryAdminBookings } from '../utils/queryAdminBookings';
import type {
  AdminBookingListQuery,
  AdminBookingModifyInput,
} from '../types/adminBooking';
import { EMPTY_ADMIN_BOOKING_QUERY } from '../types/adminBooking';
import type { AdminBookingsApi } from './adminBookingsApi.types';
import { createSeedAdminBookings } from './adminBookingsData';

const MOCK_DELAY_MS = process.env.NODE_ENV === 'test' ? 0 : 250;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function cloneBooking(booking: Booking): Booking {
  return JSON.parse(JSON.stringify(booking)) as Booking;
}

function syncCustomerStore(booking: Booking) {
  useBookingsStore.getState().saveBooking(cloneBooking(booking));
}

export function createMockAdminBookingsApi(
  options: { delayMs?: number; initialBookings?: Booking[] } = {},
): AdminBookingsApi & {
  reset: () => void;
  getState: () => Booking[];
} {
  const delayMs = options.delayMs ?? MOCK_DELAY_MS;
  let bookings = (options.initialBookings ?? createSeedAdminBookings()).map(cloneBooking);

  return {
    reset() {
      bookings = (options.initialBookings ?? createSeedAdminBookings()).map(cloneBooking);
    },
    getState() {
      return bookings.map(cloneBooking);
    },
    async listBookings(query?: AdminBookingListQuery) {
      await delay(delayMs);
      return queryAdminBookings(bookings.map(cloneBooking), query ?? EMPTY_ADMIN_BOOKING_QUERY);
    },
    async getBooking(reference: string) {
      await delay(delayMs);
      const booking = bookings.find((item) => item.reference === reference);
      if (!booking) {
        throw new Error('Booking not found');
      }
      return cloneBooking(booking);
    },
    async cancelBooking(reference: string) {
      await delay(delayMs);
      const index = bookings.findIndex((item) => item.reference === reference);
      if (index < 0) {
        throw new Error('Booking not found');
      }
      const updated = applyBookingCancellation(bookings[index]!);
      bookings = bookings.map((item, itemIndex) => (itemIndex === index ? updated : item));
      syncCustomerStore(updated);
      return cloneBooking(updated);
    },
    async refundBooking(reference: string) {
      await delay(delayMs);
      const index = bookings.findIndex((item) => item.reference === reference);
      if (index < 0) {
        throw new Error('Booking not found');
      }
      const updated = applyBookingRefund(bookings[index]!);
      bookings = bookings.map((item, itemIndex) => (itemIndex === index ? updated : item));
      syncCustomerStore(updated);
      return cloneBooking(updated);
    },
    async modifyBooking(reference: string, input: AdminBookingModifyInput) {
      await delay(delayMs);
      const index = bookings.findIndex((item) => item.reference === reference);
      if (index < 0) {
        throw new Error('Booking not found');
      }
      const updated = applyBookingModify(bookings[index]!, input);
      bookings = bookings.map((item, itemIndex) => (itemIndex === index ? updated : item));
      syncCustomerStore(updated);
      return cloneBooking(updated);
    },
    async listFlightOptions() {
      await delay(delayMs);
      return listFlightFilterOptions(bookings);
    },
  };
}

export const mockAdminBookingsApi = createMockAdminBookingsApi();
