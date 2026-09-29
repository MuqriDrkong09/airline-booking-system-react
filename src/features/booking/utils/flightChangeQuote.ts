import type { FlightOffer } from '@/features/flights';
import { FLIGHT_CHANGE_FEE_PER_PASSENGER } from '../constants/manageBooking';
import type { Booking } from '../types/bookingRecord';
import { roundMoney } from './priceBreakdown';
import { recomputeBookingPriceBreakdown } from './recomputeBookingPriceBreakdown';

export interface FlightChangeQuote {
  currency: string;
  originalFare: number;
  newFare: number;
  changeFee: number;
  fareDifference: number;
  /** Positive = amount due; negative = refund. */
  netAmountDue: number;
  passengerCount: number;
}

export function calculateFlightChangeQuote(
  booking: Booking,
  newFlight: FlightOffer,
): FlightChangeQuote {
  const passengerCount = Math.max(
    booking.passengers.filter((passenger) => passenger.type !== 'INFANT').length,
    1,
  );
  const currency = newFlight.price.currency || booking.priceBreakdown.currency;
  const originalFare = roundMoney(booking.flight.price.amount * passengerCount);
  const newFare = roundMoney(newFlight.price.amount * passengerCount);
  const changeFee = roundMoney(FLIGHT_CHANGE_FEE_PER_PASSENGER * passengerCount);
  const fareDifference = roundMoney(newFare - originalFare);
  const netAmountDue = roundMoney(fareDifference + changeFee);

  return {
    currency,
    originalFare,
    newFare,
    changeFee,
    fareDifference,
    netAmountDue,
    passengerCount,
  };
}

/**
 * Applies a flight change: replaces flight snapshot, clears seats (new aircraft),
 * keeps baggage/meals/addons where possible, recomputes price breakdown.
 */
export function buildBookingAfterFlightChange(
  booking: Booking,
  newFlight: FlightOffer,
  now = new Date().toISOString(),
): Booking {
  const nextCabin = newFlight.cabinClass || booking.cabinClass;
  const draft: Booking = {
    ...booking,
    flightId: newFlight.id,
    cabinClass: nextCabin,
    flight: JSON.parse(JSON.stringify(newFlight)) as FlightOffer,
    seats: [],
    updatedAt: now,
  };

  return {
    ...draft,
    priceBreakdown: recomputeBookingPriceBreakdown(draft),
  };
}
