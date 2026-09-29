import type { Booking } from '../types/bookingRecord';
import {
  CANCELLATION_ANCILLARY_RETENTION_RATE,
  CANCELLATION_FEE_REFUNDABLE_MINIMUM,
  CANCELLATION_FEE_REFUNDABLE_PER_PASSENGER,
} from '../constants/cancellation';
import { roundMoney } from './priceBreakdown';
import {
  getBookingDepartureDate,
  getBookingTab,
  isCancelledBooking,
} from './bookingStatus';

export interface CancellationQuote {
  currency: string;
  paidTotal: number;
  cancellationFee: number;
  refundAmount: number;
  policySummary: string;
  refundableFare: boolean;
  passengerCount: number;
  /** Status applied after confirmation once processing completes. */
  finalStatus: 'CANCELLED' | 'REFUNDED';
}

export function isCompletedFlight(booking: Booking, todayIso: string): boolean {
  if (booking.status === 'COMPLETED') {
    return true;
  }
  return getBookingTab(booking, todayIso) === 'past';
}

/**
 * Cancellation is allowed only for active upcoming bookings that are not already
 * cancelled / refunded / completed.
 */
export function canCancelBooking(booking: Booking, todayIso: string): boolean {
  if (isCancelledBooking(booking) || booking.status === 'CANCELLATION_REQUESTED') {
    return false;
  }
  if (isCompletedFlight(booking, todayIso)) {
    return false;
  }
  return booking.status === 'PENDING' || booking.status === 'CONFIRMED';
}

export function calculateCancellationQuote(booking: Booking): CancellationQuote {
  const currency = booking.priceBreakdown.currency;
  const paidTotal = roundMoney(booking.priceBreakdown.finalTotal);
  const passengerCount = Math.max(
    booking.passengers.filter((passenger) => passenger.type !== 'INFANT').length,
    1,
  );
  const refundableFare = booking.flight.refundable;
  const policySummary =
    booking.flight.policies.refundPolicy.trim() ||
    (refundableFare
      ? 'Refundable fare: a cancellation fee applies; the remainder is refunded.'
      : 'Non-refundable fare: the base fare is forfeited; limited ancillary refund may apply.');

  const ancillaryTotal = roundMoney(
    booking.priceBreakdown.seatCost +
      booking.priceBreakdown.baggageCost +
      booking.priceBreakdown.mealCost +
      booking.priceBreakdown.addonCost,
  );

  let cancellationFee: number;
  if (refundableFare) {
    cancellationFee = roundMoney(
      Math.max(
        CANCELLATION_FEE_REFUNDABLE_MINIMUM,
        CANCELLATION_FEE_REFUNDABLE_PER_PASSENGER * passengerCount,
      ),
    );
    cancellationFee = Math.min(cancellationFee, paidTotal);
  } else {
    const retainedAncillaries = roundMoney(
      ancillaryTotal * CANCELLATION_ANCILLARY_RETENTION_RATE,
    );
    cancellationFee = roundMoney(
      Math.min(paidTotal, booking.priceBreakdown.baseFare + retainedAncillaries),
    );
  }

  const refundAmount = roundMoney(Math.max(0, paidTotal - cancellationFee));
  const finalStatus: 'CANCELLED' | 'REFUNDED' =
    refundAmount > 0 ? 'REFUNDED' : 'CANCELLED';

  return {
    currency,
    paidTotal,
    cancellationFee,
    refundAmount,
    policySummary,
    refundableFare,
    passengerCount,
    finalStatus,
  };
}

export function getCancellationBlockedReason(
  booking: Booking,
  todayIso: string,
): string | null {
  if (booking.status === 'CANCELLATION_REQUESTED') {
    return 'A cancellation request is already in progress for this booking.';
  }
  if (booking.status === 'CANCELLED' || booking.status === 'REFUNDED') {
    return 'This booking has already been cancelled.';
  }
  if (booking.status === 'COMPLETED' || getBookingDepartureDate(booking) < todayIso) {
    return 'Completed or departed flights cannot be cancelled.';
  }
  if (booking.status === 'CHECKED_IN') {
    return 'Checked-in bookings cannot be cancelled from here. Contact support.';
  }
  return null;
}
