import type { Booking, BookingPassenger } from '../types/bookingRecord';
import {
  CHECK_IN_CLOSES_HOURS_BEFORE,
  CHECK_IN_OPENS_HOURS_BEFORE,
} from '../constants/checkIn';

function isCancelledBooking(booking: Booking): boolean {
  return (
    booking.status === 'CANCELLATION_REQUESTED' ||
    booking.status === 'CANCELLED' ||
    booking.status === 'REFUNDED'
  );
}
export type CheckInBlockedReason =
  | 'NOT_FOUND'
  | 'LAST_NAME_MISMATCH'
  | 'CANCELLED'
  | 'DEPARTED'
  | 'WINDOW_NOT_OPEN'
  | 'WINDOW_CLOSED'
  | 'ALREADY_CHECKED_IN'
  | 'NOT_ELIGIBLE_STATUS'
  | 'NO_ELIGIBLE_PASSENGERS';

export const CHECK_IN_BLOCKED_MESSAGES: Record<CheckInBlockedReason, string> = {
  NOT_FOUND: 'We could not find a booking with that reference.',
  LAST_NAME_MISMATCH:
    'The last name does not match any passenger on this booking.',
  CANCELLED: 'This booking is cancelled and cannot be checked in.',
  DEPARTED: 'This flight has already departed.',
  WINDOW_NOT_OPEN: `Online check-in opens ${CHECK_IN_OPENS_HOURS_BEFORE} hours before departure.`,
  WINDOW_CLOSED: `Online check-in closed ${CHECK_IN_CLOSES_HOURS_BEFORE} hour before departure.`,
  ALREADY_CHECKED_IN: 'All passengers on this booking are already checked in.',
  NOT_ELIGIBLE_STATUS: 'Only confirmed bookings can complete online check-in.',
  NO_ELIGIBLE_PASSENGERS: 'There are no passengers eligible for check-in.',
};

/** Parse flight local datetime `YYYY-MM-DDTHH:mm` as a local Date. */
export function parseFlightDepartureLocal(isoLocal: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(isoLocal);
  if (!match) {
    return null;
  }
  const [, year, month, day, hour, minute] = match;
  const date = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    0,
    0,
  );
  return Number.isNaN(date.getTime()) ? null : date;
}

export function getCheckedInPassengerIds(booking: Booking): string[] {
  return booking.checkedInPassengerIds ?? [];
}

export function isPassengerCheckedIn(booking: Booking, passengerId: string): boolean {
  return getCheckedInPassengerIds(booking).includes(passengerId);
}

export function isFlightDeparted(booking: Booking, now: Date = new Date()): boolean {
  const departure = parseFlightDepartureLocal(booking.flight.departureTime);
  if (!departure) {
    return false;
  }
  return now.getTime() >= departure.getTime();
}

export function getCheckInWindow(booking: Booking): {
  opensAt: Date;
  closesAt: Date;
  departureAt: Date;
} | null {
  const departure = parseFlightDepartureLocal(booking.flight.departureTime);
  if (!departure) {
    return null;
  }

  const opensAt = new Date(departure.getTime());
  opensAt.setHours(opensAt.getHours() - CHECK_IN_OPENS_HOURS_BEFORE);

  const closesAt = new Date(departure.getTime());
  closesAt.setHours(closesAt.getHours() - CHECK_IN_CLOSES_HOURS_BEFORE);

  return { opensAt, closesAt, departureAt: departure };
}

export function isCheckInWindowOpen(booking: Booking, now: Date = new Date()): boolean {
  const window = getCheckInWindow(booking);
  if (!window) {
    return false;
  }
  return now.getTime() >= window.opensAt.getTime() && now.getTime() < window.closesAt.getTime();
}

export function normalizeLastName(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function bookingMatchesLastName(booking: Booking, lastName: string): boolean {
  const needle = normalizeLastName(lastName);
  if (!needle) {
    return false;
  }
  return booking.passengers.some(
    (passenger) => normalizeLastName(passenger.lastName) === needle,
  );
}

export function getEligibleCheckInPassengers(booking: Booking): BookingPassenger[] {
  return booking.passengers.filter(
    (passenger) => !isPassengerCheckedIn(booking, passenger.id),
  );
}

export function getCheckInBlockedReason(
  booking: Booking | null | undefined,
  options: { lastName?: string; now?: Date } = {},
): CheckInBlockedReason | null {
  const now = options.now ?? new Date();

  if (!booking) {
    return 'NOT_FOUND';
  }

  if (options.lastName !== undefined && !bookingMatchesLastName(booking, options.lastName)) {
    return 'LAST_NAME_MISMATCH';
  }

  if (isCancelledBooking(booking)) {
    return 'CANCELLED';
  }

  if (booking.status !== 'CONFIRMED' && booking.status !== 'CHECKED_IN') {
    return 'NOT_ELIGIBLE_STATUS';
  }

  if (isFlightDeparted(booking, now)) {
    return 'DEPARTED';
  }

  const window = getCheckInWindow(booking);
  if (!window) {
    return 'NOT_ELIGIBLE_STATUS';
  }

  if (now.getTime() < window.opensAt.getTime()) {
    return 'WINDOW_NOT_OPEN';
  }

  if (now.getTime() >= window.closesAt.getTime()) {
    return 'WINDOW_CLOSED';
  }

  const eligible = getEligibleCheckInPassengers(booking);
  if (eligible.length === 0) {
    return 'ALREADY_CHECKED_IN';
  }

  return null;
}

export function canCheckInBooking(
  booking: Booking,
  _todayIso?: string,
  now: Date = new Date(),
): boolean {
  return getCheckInBlockedReason(booking, { now }) === null;
}

export function findBookingForCheckIn(
  bookings: Booking[],
  reference: string,
  lastName: string,
): { booking?: Booking; reason: CheckInBlockedReason | null } {
  const trimmedRef = reference.trim();
  const booking = bookings.find(
    (item) => item.reference.toUpperCase() === trimmedRef.toUpperCase(),
  );

  if (!booking) {
    return { reason: 'NOT_FOUND' };
  }

  if (!bookingMatchesLastName(booking, lastName)) {
    return { booking, reason: 'LAST_NAME_MISMATCH' };
  }

  return {
    booking,
    reason: getCheckInBlockedReason(booking, { lastName, now: new Date() }),
  };
}

export function seatLabelForPassenger(booking: Booking, passengerId: string): string {
  return booking.seats.find((seat) => seat.passengerId === passengerId)?.label ?? 'Not assigned';
}

export function baggageSummaryForPassenger(
  booking: Booking,
  passengerId: string,
): string {
  const selection = booking.baggage.find((item) => item.passengerId === passengerId);
  if (!selection) {
    return 'No baggage selected';
  }
  const parts = [`Cabin ${selection.cabinKg}kg`];
  if (selection.checkedKg > 0) {
    parts.push(`Checked ${selection.checkedKg}kg`);
  }
  if (selection.additionalKg > 0) {
    parts.push(`Extra ${selection.additionalKg}kg`);
  }
  return parts.join(' · ');
}
