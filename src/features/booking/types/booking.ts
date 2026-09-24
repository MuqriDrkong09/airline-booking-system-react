import type { AddonSelection } from '@/features/addons/types/addon';
import type { PassengerBaggageSelection } from '@/features/baggage/types/baggage';
import type { CabinClass, FlightOffer, FlightSearchCriteria } from '@/features/flights';
import type { PassengerMealSelection } from '@/features/meals/types/meal';
import type { PassengerDraft } from '@/features/passengers';

export const BOOKING_STATUSES = [
  'DRAFT',
  'PENDING_PAYMENT',
  'CONFIRMED',
  'CANCELLED',
  'FAILED',
] as const;

export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const PAYMENT_METHODS = [
  'CREDIT_CARD',
  'DEBIT_CARD',
  'FPX',
  'E_WALLET',
] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

/** Seat assignment persisted on the booking with priced snapshot. */
export interface BookingSeatSelection {
  passengerId: string;
  seatId: string;
  label: string;
  price: number;
}

/**
 * Safe payment snapshot only — never includes PAN, CVV, or full expiry.
 * Card number / security code must not be written to this store or localStorage.
 */
export interface BookingPaymentInfo {
  method: PaymentMethod | null;
  billingName: string;
  billingEmail: string;
  cardBrand: string;
  cardLast4: string;
}

export interface BookingPromoCode {
  code: string;
  /** Percent off subtotal (0–100) or fixed currency amount. */
  discountType: 'PERCENT' | 'FIXED';
  discountValue: number;
  /** Caps percentage (or oversized fixed) discounts when set. */
  maxDiscount?: number | null;
  currency?: string;
  description?: string;
}

export interface BookingPriceBreakdown {
  currency: string;
  baseFare: number;
  seatCost: number;
  baggageCost: number;
  mealCost: number;
  addonCost: number;
  subtotal: number;
  discount: number;
  taxes: number;
  finalTotal: number;
}

export interface BookingData {
  searchCriteria: FlightSearchCriteria | null;
  selectedFlight: FlightOffer | null;
  /** Denormalized for step panels that key off flight id. */
  flightId: string | null;
  cabinClass: CabinClass | null;
  passengers: PassengerDraft[];
  seats: BookingSeatSelection[];
  baggage: PassengerBaggageSelection[];
  meals: PassengerMealSelection[];
  addons: AddonSelection[];
  /** Cached line totals used by existing panels and selectors. */
  seatTotal: number;
  baggageTotal: number;
  mealTotal: number;
  addonTotal: number;
  promoCode: BookingPromoCode | null;
  payment: BookingPaymentInfo | null;
  priceBreakdown: BookingPriceBreakdown;
  bookingReference: string | null;
  bookingStatus: BookingStatus;
  updatedAt: string | null;
}

export const EMPTY_PRICE_BREAKDOWN: BookingPriceBreakdown = {
  currency: 'USD',
  baseFare: 0,
  seatCost: 0,
  baggageCost: 0,
  mealCost: 0,
  addonCost: 0,
  subtotal: 0,
  discount: 0,
  taxes: 0,
  finalTotal: 0,
};

export const EMPTY_PAYMENT: BookingPaymentInfo = {
  method: null,
  billingName: '',
  billingEmail: '',
  cardBrand: '',
  cardLast4: '',
};
