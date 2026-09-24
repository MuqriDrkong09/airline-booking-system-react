import { validateAddonSelections } from '@/features/addons/utils/addonRules';
import { validateBaggageSelection } from '@/features/baggage/utils/baggageRules';
import { PASSENGER_TYPE_LABELS, type PassengerDraft } from '@/features/passengers';
import { passengerDisplayName } from '@/features/seats';
import type { BookingData, BookingPaymentInfo, BookingSeatSelection } from '../types/booking';

export type BookingValidationResult =
  | { ok: true }
  | { ok: false; step: BookingValidationStep; message: string };

export type BookingValidationStep =
  | 'booking'
  | 'passengers'
  | 'seats'
  | 'baggage'
  | 'addons'
  | 'payment';

function displayName(passenger: PassengerDraft, index: number): string {
  return passengerDisplayName(
    passenger.firstName,
    passenger.lastName,
    `${PASSENGER_TYPE_LABELS[passenger.type]} ${index + 1}`,
  );
}

export function validateBookingState(draft: BookingData): BookingValidationResult {
  if (!draft.selectedFlight || !draft.flightId) {
    return { ok: false, step: 'booking', message: 'A selected flight is required.' };
  }
  if (draft.selectedFlight.id !== draft.flightId) {
    return {
      ok: false,
      step: 'booking',
      message: 'Flight selection does not match this checkout session.',
    };
  }
  if (!draft.cabinClass) {
    return { ok: false, step: 'booking', message: 'Cabin class is required.' };
  }
  if (draft.priceBreakdown.finalTotal <= 0) {
    return {
      ok: false,
      step: 'booking',
      message: 'Booking total must be greater than zero.',
    };
  }
  return { ok: true };
}

export function validateBookingPassengers(passengers: PassengerDraft[]): BookingValidationResult {
  if (passengers.length === 0) {
    return { ok: false, step: 'passengers', message: 'Add at least one passenger.' };
  }

  for (let index = 0; index < passengers.length; index += 1) {
    const passenger = passengers[index]!;
    const name = displayName(passenger, index);

    if (!passenger.firstName.trim() || !passenger.lastName.trim()) {
      return {
        ok: false,
        step: 'passengers',
        message: `Complete the name for ${name}.`,
      };
    }
    if (!passenger.dateOfBirth.trim()) {
      return {
        ok: false,
        step: 'passengers',
        message: `Date of birth is required for ${name}.`,
      };
    }
    if (!passenger.gender) {
      return {
        ok: false,
        step: 'passengers',
        message: `Gender is required for ${name}.`,
      };
    }
    if (passenger.type === 'INFANT' && !passenger.associatedAdultId) {
      return {
        ok: false,
        step: 'passengers',
        message: `${name} must be linked to an accompanying adult.`,
      };
    }
  }

  const adults = new Set(
    passengers.filter((passenger) => passenger.type === 'ADULT').map((passenger) => passenger.id),
  );
  for (const passenger of passengers) {
    if (
      passenger.type === 'INFANT' &&
      passenger.associatedAdultId &&
      !adults.has(passenger.associatedAdultId)
    ) {
      return {
        ok: false,
        step: 'passengers',
        message: 'An infant is linked to an unknown adult passenger.',
      };
    }
  }

  return { ok: true };
}

export function validateBookingSeats(
  passengers: PassengerDraft[],
  seats: BookingSeatSelection[],
): BookingValidationResult {
  const needingSeats = passengers.filter((passenger) => passenger.type !== 'INFANT');
  if (needingSeats.length === 0) {
    return { ok: true };
  }

  if (seats.length < needingSeats.length) {
    return {
      ok: false,
      step: 'seats',
      message: 'Assign a seat to every adult and child before confirming.',
    };
  }

  const byPassenger = new Map(seats.map((seat) => [seat.passengerId, seat]));
  const usedSeats = new Set<string>();

  for (const passenger of needingSeats) {
    const assignment = byPassenger.get(passenger.id);
    if (!assignment?.seatId || !assignment.label) {
      return {
        ok: false,
        step: 'seats',
        message: `Missing seat for ${displayName(passenger, 0)}.`,
      };
    }
    if (usedSeats.has(assignment.seatId)) {
      return {
        ok: false,
        step: 'seats',
        message: 'Each seat can only be assigned to one passenger.',
      };
    }
    usedSeats.add(assignment.seatId);
  }

  return { ok: true };
}

export function validateBookingBaggage(draft: BookingData): BookingValidationResult {
  if (draft.passengers.length === 0) {
    return { ok: true };
  }

  const passengers = draft.passengers.map((passenger, index) => ({
    id: passenger.id,
    type: passenger.type,
    displayName: displayName(passenger, index),
  }));

  if (draft.baggage.length === 0) {
    return {
      ok: false,
      step: 'baggage',
      message: 'Choose baggage for every passenger before confirming.',
    };
  }

  const result = validateBaggageSelection({
    selections: draft.baggage,
    passengers,
  });

  if (!result.ok) {
    return { ok: false, step: 'baggage', message: result.message };
  }

  return { ok: true };
}

export function validateBookingAddons(draft: BookingData): BookingValidationResult {
  if (draft.addons.length === 0) {
    return { ok: true };
  }

  const passengers = draft.passengers.map((passenger, index) => ({
    id: passenger.id,
    type: passenger.type,
    displayName: displayName(passenger, index),
  }));

  const result = validateAddonSelections({
    selections: draft.addons,
    passengers,
  });

  if (!result.ok) {
    return { ok: false, step: 'addons', message: result.message };
  }

  return { ok: true };
}

export function validateBookingPayment(
  payment: BookingPaymentInfo | null,
): BookingValidationResult {
  if (!payment?.method) {
    return {
      ok: false,
      step: 'payment',
      message: 'Payment details are required before creating a booking.',
    };
  }
  return { ok: true };
}

/** Runs checkout validations in the order required by the booking creation flow. */
export function validateCheckoutForBooking(draft: BookingData): BookingValidationResult {
  const steps = [
    () => validateBookingState(draft),
    () => validateBookingPassengers(draft.passengers),
    () => validateBookingSeats(draft.passengers, draft.seats),
    () => validateBookingBaggage(draft),
    () => validateBookingAddons(draft),
    () => validateBookingPayment(draft.payment),
  ] as const;

  for (const step of steps) {
    const result = step();
    if (!result.ok) {
      return result;
    }
  }

  return { ok: true };
}
