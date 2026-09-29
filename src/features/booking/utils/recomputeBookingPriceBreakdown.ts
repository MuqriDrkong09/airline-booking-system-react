import { calculateAddonTotal } from '@/features/addons/utils/addonRules';
import {
  calculateBaggageTotal,
  getAllowanceForCabin,
} from '@/features/baggage/utils/baggageRules';
import { calculateMealTotal } from '@/features/meals/utils/mealRules';
import type { BookingPriceBreakdown } from '../types/booking';
import type { Booking, BookingPassenger } from '../types/bookingRecord';
import { buildPriceBreakdown, calculateSeatCost } from './priceBreakdown';

function countFarePayingPassengers(passengers: BookingPassenger[]): number {
  return passengers.filter((passenger) => passenger.type !== 'INFANT').length;
}

export function recomputeBookingPriceBreakdown(
  booking: Pick<
    Booking,
    | 'flight'
    | 'cabinClass'
    | 'passengers'
    | 'seats'
    | 'baggage'
    | 'meals'
    | 'addons'
    | 'promoCode'
  >,
): BookingPriceBreakdown {
  const farePassengers = countFarePayingPassengers(booking.passengers);
  const allowance = getAllowanceForCabin(booking.cabinClass);
  const baggagePassengers = booking.passengers.map((passenger) => ({
    id: passenger.id,
    type: passenger.type,
    displayName: `${passenger.firstName} ${passenger.lastName}`.trim() || passenger.id,
  }));

  return buildPriceBreakdown({
    baseFare: booking.flight.price.amount * farePassengers,
    seatCost: calculateSeatCost(booking.seats),
    baggageCost: calculateBaggageTotal(booking.baggage, baggagePassengers, allowance),
    mealCost: calculateMealTotal(booking.meals),
    addonCost: calculateAddonTotal(booking.addons),
    promoCode: booking.promoCode,
    currency: booking.flight.price.currency,
  });
}
