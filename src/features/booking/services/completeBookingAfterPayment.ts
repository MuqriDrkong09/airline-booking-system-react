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
  /**
   * When false, leaves the draft checkout stores intact so the caller can
   * navigate away before clearing (avoids a payment-page empty-state flash).
   * Defaults to true.
   */
  clearDrafts?: boolean;
}

/** Clears temporary checkout stores after a successful booking confirmation. */
export function clearCheckoutDrafts(): void {
  useBookingStore.getState().clearBooking();
  usePassengerDraftStore.getState().clearDraft();
  useSeatSelectionStore.getState().clearSelection();
}

/**
 * Payment-success pipeline:
 * validate → create → generate reference → save → (optional) clear temporary checkout state.
 */
export function completeBookingAfterPayment(
  input: CompleteBookingAfterPaymentInput,
): CompleteBookingResult {
  const draft = useBookingStore.getState();
  const clearDrafts = input.clearDrafts ?? true;

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

    if (clearDrafts) {
      clearCheckoutDrafts();
    }

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
