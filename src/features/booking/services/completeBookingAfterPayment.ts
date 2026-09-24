import { usePassengerDraftStore } from '@/features/passengers';
import { useSeatSelectionStore } from '@/features/seats';
import { useBookingStore } from '../store/bookingStore';
import { useBookingsStore } from '../store/bookingsStore';
import type { BookingPaymentInfo } from '../types/booking';
import type { Booking } from '../types/bookingRecord';
import { createBooking, generateBookingReference } from '../utils/createBooking';
import {
  validateCheckoutForBooking,
  type BookingValidationStep,
} from '../utils/validateCheckout';

export type CompleteBookingResult =
  | { ok: true; booking: Booking }
  | { ok: false; message: string; step?: BookingValidationStep };

export interface CompleteBookingAfterPaymentInput {
  transactionId: string;
  payment: BookingPaymentInfo;
}

/**
 * Payment-success pipeline:
 * validate → create → generate reference → save → clear temporary checkout state.
 */
export function completeBookingAfterPayment(
  input: CompleteBookingAfterPaymentInput,
): CompleteBookingResult {
  const draft = useBookingStore.getState();

  const withPayment = {
    ...draft,
    payment: input.payment,
  };

  const validation = validateCheckoutForBooking(withPayment);
  if (!validation.ok) {
    return {
      ok: false,
      step: validation.step,
      message: validation.message,
    };
  }

  try {
    const reference = generateBookingReference(input.transactionId);
    const booking = createBooking({
      draft: withPayment,
      payment: input.payment,
      transactionId: input.transactionId,
      reference,
      status: 'CONFIRMED',
    });

    useBookingsStore.getState().saveBooking(booking);

    useBookingStore.getState().clearBooking();
    usePassengerDraftStore.getState().clearDraft();
    useSeatSelectionStore.getState().clearSelection();

    return { ok: true, booking };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : 'Unable to create the booking from the current checkout state.',
    };
  }
}
