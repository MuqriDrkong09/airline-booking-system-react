import type { AddonSelection } from '@/features/addons/types/addon';
import type { PassengerBaggageSelection } from '@/features/baggage/types/baggage';
import type { CabinClass, FlightOffer, FlightSearchCriteria } from '@/features/flights';
import type { PassengerMealSelection } from '@/features/meals/types/meal';
import type { Gender, PassengerType } from '@/features/passengers';
import type {
  BookingPaymentInfo,
  BookingPriceBreakdown,
  BookingPromoCode,
  BookingSeatSelection,
} from './booking';

/**
 * Lifecycle status of a persisted booking (distinct from checkout draft status).
 */
export const BOOKING_RECORD_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'CANCELLED',
  'CHECKED_IN',
  'COMPLETED',
  'REFUNDED',
] as const;

export type BookingRecordStatus = (typeof BOOKING_RECORD_STATUSES)[number];

/** Alias matching the product vocabulary for saved bookings. */
export type BookingDomainStatus = BookingRecordStatus;
export const BOOKING_DOMAIN_STATUSES = BOOKING_RECORD_STATUSES;

/** Immutable passenger snapshot stored on a confirmed booking. */
export interface BookingPassenger {
  id: string;
  type: PassengerType;
  title: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: Gender | '';
  nationality: string;
  passportNumber: string;
  passportExpiry: string;
  email: string;
  phone: string;
  associatedAdultId: string;
}

/**
 * Strongly typed Booking domain model — the source of truth after checkout.
 * Never includes raw card PAN, CVV, or full expiry.
 */
export interface Booking {
  /** Internal id (stable). */
  id: string;
  /** Human-facing booking reference (e.g. AB-XXXXXXXX). */
  reference: string;
  status: BookingRecordStatus;
  createdAt: string;
  updatedAt: string;
  flightId: string;
  cabinClass: CabinClass;
  /** Flight offer snapshot at time of booking. */
  flight: FlightOffer;
  searchCriteria: FlightSearchCriteria | null;
  passengers: BookingPassenger[];
  seats: BookingSeatSelection[];
  baggage: PassengerBaggageSelection[];
  meals: PassengerMealSelection[];
  addons: AddonSelection[];
  promoCode: BookingPromoCode | null;
  /** Safe payment snapshot only. */
  payment: BookingPaymentInfo;
  priceBreakdown: BookingPriceBreakdown;
  transactionId: string;
}

export type BookingId = Booking['id'];
export type BookingReference = Booking['reference'];
