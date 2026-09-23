import { calculateAddonTotal } from '@/features/addons/utils/addonRules';
import type {
  BookingData,
  BookingPaymentInfo,
  BookingPriceBreakdown,
  BookingPromoCode,
  BookingSeatSelection,
} from '../types/booking';
import { EMPTY_PRICE_BREAKDOWN } from '../types/booking';

/** Flat tax rate applied after discounts. */
export const BOOKING_TAX_RATE = 0.08;

export function countFarePassengers(passengers: BookingData['passengers']): number {
  return passengers.filter((passenger) => passenger.type !== 'INFANT').length;
}

export function calculateSeatCost(seats: BookingSeatSelection[]): number {
  return seats.reduce((sum, seat) => sum + seat.price, 0);
}

export function calculateDiscount(
  subtotal: number,
  promo: BookingPromoCode | null,
): number {
  if (!promo || subtotal <= 0) {
    return 0;
  }

  let discount: number;
  if (promo.discountType === 'PERCENT') {
    const percent = Math.min(Math.max(promo.discountValue, 0), 100);
    discount = (subtotal * percent) / 100;
  } else {
    discount = Math.max(promo.discountValue, 0);
  }

  if (typeof promo.maxDiscount === 'number' && promo.maxDiscount >= 0) {
    discount = Math.min(discount, promo.maxDiscount);
  }

  return roundMoney(Math.min(discount, subtotal));
}

export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function buildPriceBreakdown(input: {
  baseFare: number;
  seatCost: number;
  baggageCost: number;
  mealCost: number;
  addonCost: number;
  promoCode: BookingPromoCode | null;
  currency?: string;
}): BookingPriceBreakdown {
  const seatCost = roundMoney(input.seatCost);
  const baggageCost = roundMoney(input.baggageCost);
  const mealCost = roundMoney(input.mealCost);
  const addonCost = roundMoney(input.addonCost);
  const baseFare = roundMoney(input.baseFare);
  const subtotal = roundMoney(baseFare + seatCost + baggageCost + mealCost + addonCost);
  const discount = calculateDiscount(subtotal, input.promoCode);
  const taxable = Math.max(0, subtotal - discount);
  const taxes = roundMoney(taxable * BOOKING_TAX_RATE);
  const finalTotal = roundMoney(taxable + taxes);

  return {
    currency: input.currency ?? EMPTY_PRICE_BREAKDOWN.currency,
    baseFare,
    seatCost,
    baggageCost,
    mealCost,
    addonCost,
    subtotal,
    discount,
    taxes,
    finalTotal,
  };
}

export function priceBreakdownFromBooking(state: Pick<
  BookingData,
  | 'selectedFlight'
  | 'passengers'
  | 'seats'
  | 'baggageTotal'
  | 'mealTotal'
  | 'addons'
  | 'promoCode'
>): BookingPriceBreakdown {
  const farePassengers = Math.max(countFarePassengers(state.passengers), 0);
  const unitFare = state.selectedFlight?.price.amount ?? 0;
  const currency = state.selectedFlight?.price.currency ?? 'USD';

  return buildPriceBreakdown({
    baseFare: unitFare * (farePassengers || (state.selectedFlight ? 1 : 0)),
    seatCost: calculateSeatCost(state.seats),
    baggageCost: state.baggageTotal,
    mealCost: state.mealTotal,
    addonCost: calculateAddonTotal(state.addons),
    promoCode: state.promoCode,
    currency,
  });
}

/**
 * Strips any accidental sensitive card fields before payment is stored.
 * Only brand / last4 / billing contact / method are kept.
 */
export function toSafePaymentInfo(
  payment: Partial<BookingPaymentInfo> & Record<string, unknown>,
): BookingPaymentInfo {
  return {
    method: (payment.method as BookingPaymentInfo['method']) ?? null,
    billingName: typeof payment.billingName === 'string' ? payment.billingName : '',
    billingEmail: typeof payment.billingEmail === 'string' ? payment.billingEmail : '',
    cardBrand: typeof payment.cardBrand === 'string' ? payment.cardBrand : '',
    cardLast4: typeof payment.cardLast4 === 'string' ? payment.cardLast4.slice(-4) : '',
  };
}
