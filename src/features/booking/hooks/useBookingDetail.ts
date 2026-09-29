import { useEffect, useState } from 'react';
import type { Booking } from '../types/bookingRecord';
import { useBookingsStore } from '../store/bookingsStore';
import { isValidBookingReference } from '../utils/bookingDetailHelpers';

export type BookingDetailStatus = 'loading' | 'error' | 'not_found' | 'ready';

export interface BookingDetailState {
  status: BookingDetailStatus;
  booking: Booking | null;
  reference: string;
  retry: () => void;
}

export function useBookingDetail(bookingReference: string): BookingDetailState {
  const reference = bookingReference.trim();
  const [hydrated, setHydrated] = useState(() => useBookingsStore.persist.hasHydrated());
  const [retryToken, setRetryToken] = useState(0);

  const booking = useBookingsStore((state) =>
    reference ? state.bookings.find((item) => item.reference === reference) : undefined,
  );

  useEffect(() => {
    const finish = () => setHydrated(true);
    setHydrated(useBookingsStore.persist.hasHydrated());
    const unsubscribe = useBookingsStore.persist.onFinishHydration(finish);
    return unsubscribe;
  }, [retryToken]);

  const retry = () => {
    setHydrated(useBookingsStore.persist.hasHydrated());
    setRetryToken((value) => value + 1);
  };

  if (!reference || !isValidBookingReference(reference)) {
    return {
      status: 'error',
      booking: null,
      reference,
      retry,
    };
  }

  if (!hydrated) {
    return {
      status: 'loading',
      booking: null,
      reference,
      retry,
    };
  }

  if (!booking) {
    return {
      status: 'not_found',
      booking: null,
      reference,
      retry,
    };
  }

  return {
    status: 'ready',
    booking,
    reference,
    retry,
  };
}
