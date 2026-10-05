import type { Booking, BookingCancellationInfo } from '@/features/booking';
import {
  calculateCancellationQuote,
  canCancelBooking,
  getBookingDepartureDate,
  isCancelledBooking,
} from '@/features/booking';
import { todayIsoDate } from '@/features/flights/utils/dates';
import type { AdminBookingModifyInput } from '../types/adminBooking';

export function canRefundBooking(booking: Booking, todayIso = todayIsoDate()): boolean {
  if (booking.status === 'REFUNDED' || booking.status === 'CANCELLATION_REQUESTED') {
    return false;
  }

  if (canCancelBooking(booking, todayIso)) {
    return calculateCancellationQuote(booking).refundAmount > 0;
  }

  return (
    booking.status === 'CANCELLED' &&
    booking.flight.refundable &&
    (booking.cancellation?.refundAmount ?? 0) === 0
  );
}

export function canModifyBooking(booking: Booking): boolean {
  return !isCancelledBooking(booking) && booking.status !== 'COMPLETED';
}

export function applyBookingCancellation(booking: Booking, todayIso = todayIsoDate()): Booking {
  if (!canCancelBooking(booking, todayIso)) {
    throw new Error('This booking cannot be cancelled.');
  }

  const quote = calculateCancellationQuote(booking);
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

  return {
    ...booking,
    status: quote.finalStatus,
    cancellation,
    updatedAt: now,
  };
}

export function applyBookingRefund(booking: Booking, todayIso = todayIsoDate()): Booking {
  if (!canRefundBooking(booking, todayIso)) {
    throw new Error('This booking cannot be refunded.');
  }

  const now = new Date().toISOString();

  if (canCancelBooking(booking, todayIso)) {
    const quote = calculateCancellationQuote(booking);
    if (quote.refundAmount <= 0) {
      throw new Error('No refundable amount is available for this booking.');
    }
    const cancellation: BookingCancellationInfo = {
      requestedAt: now,
      processedAt: now,
      fee: quote.cancellationFee,
      refundAmount: quote.refundAmount,
      currency: quote.currency,
      policySummary: quote.policySummary,
      finalStatus: 'REFUNDED',
    };
    return {
      ...booking,
      status: 'REFUNDED',
      cancellation,
      updatedAt: now,
    };
  }

  const paidTotal = booking.priceBreakdown.finalTotal;
  const previousFee = booking.cancellation?.fee ?? 0;
  const refundAmount = Math.max(0, paidTotal - previousFee);

  return {
    ...booking,
    status: 'REFUNDED',
    cancellation: {
      requestedAt: booking.cancellation?.requestedAt ?? now,
      processedAt: now,
      fee: previousFee,
      refundAmount,
      currency: booking.priceBreakdown.currency,
      policySummary:
        booking.cancellation?.policySummary ||
        'Admin refund processed for a previously cancelled booking.',
      finalStatus: 'REFUNDED',
    },
    updatedAt: now,
  };
}

export function applyBookingModify(
  booking: Booking,
  input: AdminBookingModifyInput,
): Booking {
  if (!canModifyBooking(booking)) {
    throw new Error('This booking cannot be modified.');
  }

  const email = input.contactEmail?.trim();
  const phone = input.contactPhone?.trim();

  if (!email && !phone) {
    throw new Error('Provide a contact email or phone number to update.');
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Enter a valid contact email.');
  }

  const passengers = booking.passengers.map((passenger, index) => {
    if (index !== 0) {
      return passenger;
    }
    return {
      ...passenger,
      email: email || passenger.email,
      phone: phone || passenger.phone,
    };
  });

  return {
    ...booking,
    passengers,
    payment: {
      ...booking.payment,
      billingEmail: email || booking.payment.billingEmail,
    },
    updatedAt: new Date().toISOString(),
  };
}

export function listFlightFilterOptions(bookings: readonly Booking[]): string[] {
  return Array.from(new Set(bookings.map((booking) => booking.flight.flightNumber))).sort(
    (left, right) => left.localeCompare(right),
  );
}

export function bookingDepartureLabel(booking: Booking): string {
  return getBookingDepartureDate(booking);
}
