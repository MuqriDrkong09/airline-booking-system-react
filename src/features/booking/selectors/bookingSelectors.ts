import type { BookingData, BookingPriceBreakdown } from '../types/booking';
import { countFarePassengers } from '../utils/priceBreakdown';

export type BookingSelectorState = BookingData;

export function selectTotalPassengers(state: BookingSelectorState): number {
  return state.passengers.length;
}

export function selectFarePassengerCount(state: BookingSelectorState): number {
  return countFarePassengers(state.passengers);
}

export function selectTotalSeatCost(state: BookingSelectorState): number {
  return state.priceBreakdown.seatCost;
}

export function selectTotalBaggageCost(state: BookingSelectorState): number {
  return state.priceBreakdown.baggageCost;
}

export function selectTotalMealCost(state: BookingSelectorState): number {
  return state.priceBreakdown.mealCost;
}

export function selectTotalAddonCost(state: BookingSelectorState): number {
  return state.priceBreakdown.addonCost;
}

export function selectSubtotal(state: BookingSelectorState): number {
  return state.priceBreakdown.subtotal;
}

export function selectDiscount(state: BookingSelectorState): number {
  return state.priceBreakdown.discount;
}

export function selectTaxes(state: BookingSelectorState): number {
  return state.priceBreakdown.taxes;
}

export function selectFinalTotal(state: BookingSelectorState): number {
  return state.priceBreakdown.finalTotal;
}

export function selectPriceBreakdown(state: BookingSelectorState): BookingPriceBreakdown {
  return state.priceBreakdown;
}

export function selectBookingReference(state: BookingSelectorState): string | null {
  return state.bookingReference;
}

export function selectBookingStatus(state: BookingSelectorState): BookingData['bookingStatus'] {
  return state.bookingStatus;
}
