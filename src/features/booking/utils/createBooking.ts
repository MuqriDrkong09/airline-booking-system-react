import type { BookingData, BookingPaymentInfo } from '../types/booking';
import type { Booking, BookingPassenger, BookingRecordStatus } from '../types/bookingRecord';

export function generateBookingId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `bkg-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function generateBookingReference(seed?: string): string {
  const raw =
    seed?.replace(/[^A-Z0-9]/gi, '').toUpperCase() ||
    Math.random().toString(36).slice(2, 10).toUpperCase();
  const suffix = (raw + Date.now().toString(36).toUpperCase()).slice(-8);
  return `AB-${suffix}`;
}

function toBookingPassengers(draft: BookingData): BookingPassenger[] {
  return draft.passengers.map((passenger) => ({
    id: passenger.id,
    type: passenger.type,
    title: passenger.title,
    firstName: passenger.firstName,
    lastName: passenger.lastName,
    dateOfBirth: passenger.dateOfBirth,
    gender: passenger.gender,
    nationality: passenger.nationality,
    passportNumber: passenger.passportNumber,
    passportExpiry: passenger.passportExpiry,
    email: passenger.email,
    phone: passenger.phone,
    associatedAdultId: passenger.associatedAdultId,
  }));
}

export interface CreateBookingInput {
  draft: BookingData;
  payment: BookingPaymentInfo;
  transactionId: string;
  reference?: string;
  status?: BookingRecordStatus;
  now?: string;
}

/**
 * Builds a strongly typed Booking domain record from a validated checkout draft.
 */
export function createBooking(input: CreateBookingInput): Booking {
  const { draft, payment, transactionId } = input;
  const flight = draft.selectedFlight;
  if (!flight || !draft.flightId || !draft.cabinClass) {
    throw new Error('Cannot create a booking without a selected flight and cabin class.');
  }
  if (!payment.method) {
    throw new Error('Cannot create a booking without a payment method.');
  }

  const now = input.now ?? new Date().toISOString();
  const reference = input.reference ?? generateBookingReference(transactionId);

  return {
    id: generateBookingId(),
    reference,
    status: input.status ?? 'CONFIRMED',
    createdAt: now,
    updatedAt: now,
    flightId: draft.flightId,
    cabinClass: draft.cabinClass,
    flight: clone(flight),
    searchCriteria: draft.searchCriteria ? clone(draft.searchCriteria) : null,
    passengers: toBookingPassengers(draft),
    seats: draft.seats.map((seat) => ({ ...seat })),
    baggage: draft.baggage.map((item) => ({ ...item })),
    meals: draft.meals.map((item) => ({ ...item })),
    addons: draft.addons.map((item) => ({ ...item })),
    promoCode: draft.promoCode ? { ...draft.promoCode } : null,
    payment: {
      method: payment.method,
      billingName: payment.billingName,
      billingEmail: payment.billingEmail,
      cardBrand: payment.cardBrand,
      cardLast4: payment.cardLast4,
    },
    priceBreakdown: { ...draft.priceBreakdown },
    transactionId,
  };
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
