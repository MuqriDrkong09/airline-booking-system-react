import { formatCabinLabel } from '@/features/flights';
import type { Booking, BookingPassenger } from '../types/bookingRecord';
import type { BoardingPass } from '../types/boardingPass';
import { getCheckedInPassengerIds } from './checkInRules';

/** Prefix so scanners can recognize AeroBook boarding passes without embedding PII. */
export const BOARDING_PASS_QR_PREFIX = 'AEROBOOK-BP';

/** Boarding typically opens this many minutes before departure (demo). */
export const BOARDING_OPENS_MINUTES_BEFORE = 45;

function splitLocalDateTime(isoLocal: string): { date: string; time: string } {
  const [date = '', timePart = ''] = isoLocal.split('T');
  return {
    date,
    time: timePart.slice(0, 5) || isoLocal,
  };
}

function boardingOpenClock(departureIso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(departureIso);
  if (!match) {
    return splitLocalDateTime(departureIso).time;
  }
  const [, year, month, day, hour, minute] = match;
  const date = new Date(
    Date.UTC(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
    ),
  );
  date.setUTCMinutes(date.getUTCMinutes() - BOARDING_OPENS_MINUTES_BEFORE);
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}`;
}

function passengerDisplayName(passenger: BookingPassenger): string {
  return `${passenger.title} ${passenger.firstName} ${passenger.lastName}`.trim();
}

/** Deterministic demo gate from flight number so passes look realistic. */
export function assignBoardingGate(flightNumber: string): string {
  const sum = [...flightNumber].reduce((total, char) => total + char.charCodeAt(0), 0);
  return String((sum % 28) + 1);
}

/** Boarding group from cabin and seat row (demo priority bands). */
export function assignBoardingGroup(
  cabinClass: Booking['cabinClass'],
  seatLabel: string,
): string {
  if (cabinClass === 'FIRST' || cabinClass === 'BUSINESS') {
    return '1';
  }
  const row = Number.parseInt(seatLabel, 10);
  if (Number.isFinite(row) && row > 0) {
    if (row <= 10) {
      return '2';
    }
    if (row <= 20) {
      return '3';
    }
    return '4';
  }
  return cabinClass === 'PREMIUM_ECONOMY' ? '2' : '3';
}

/**
 * Builds a scan payload with booking reference + passenger sequence only.
 * Never encode name, email, passport, seat, or payment data.
 */
export function buildBoardingPassScanPayload(
  bookingReference: string,
  passengerSequence: number,
): string {
  const ref = bookingReference.trim().toUpperCase();
  const seq = String(Math.max(1, passengerSequence)).padStart(2, '0');
  return `${BOARDING_PASS_QR_PREFIX}:${ref}:${seq}`;
}

export function parseBoardingPassScanPayload(
  payload: string,
): { reference: string; sequence: string } | null {
  const trimmed = payload.trim();
  const prefix = `${BOARDING_PASS_QR_PREFIX}:`;
  if (!trimmed.startsWith(prefix)) {
    return null;
  }
  const rest = trimmed.slice(prefix.length);
  const [reference = '', sequence = ''] = rest.split(':');
  if (!reference || !sequence) {
    return null;
  }
  return { reference, sequence };
}

export function canViewBoardingPass(booking: Booking): boolean {
  if (getCheckedInPassengerIds(booking).length > 0) {
    return true;
  }
  return booking.status === 'CHECKED_IN';
}

function passengersForBoardingPass(booking: Booking): BookingPassenger[] {
  const checkedIn = new Set(getCheckedInPassengerIds(booking));
  if (checkedIn.size > 0) {
    return booking.passengers.filter((passenger) => checkedIn.has(passenger.id));
  }
  if (booking.status === 'CHECKED_IN') {
    return booking.passengers;
  }
  return [];
}

/**
 * Builds mobile/printable boarding passes for checked-in passengers.
 */
export function buildBoardingPasses(booking: Booking): BoardingPass[] {
  const { flight } = booking;
  const departure = splitLocalDateTime(flight.departureTime);
  const boardingTime = boardingOpenClock(flight.departureTime);
  const terminal = flight.origin.terminal?.trim() || 'TBA';
  const gate = assignBoardingGate(flight.flightNumber);
  const passengers = passengersForBoardingPass(booking);

  return passengers.map((passenger, index) => {
    const seat =
      booking.seats.find((item) => item.passengerId === passenger.id)?.label ??
      'Not assigned';

    return {
      bookingReference: booking.reference,
      passengerId: passenger.id,
      passengerName: passengerDisplayName(passenger),
      airline: flight.airline.name,
      airlineCode: flight.airline.code,
      flightNumber: flight.flightNumber,
      originCode: flight.origin.code,
      originCity: flight.origin.city,
      destinationCode: flight.destination.code,
      destinationCity: flight.destination.city,
      date: departure.date,
      departureTime: departure.time,
      boardingTime,
      gate,
      terminal,
      seat,
      boardingGroup: assignBoardingGroup(booking.cabinClass, seat),
      cabinClass: formatCabinLabel(booking.cabinClass),
      scanPayload: buildBoardingPassScanPayload(booking.reference, index + 1),
    };
  });
}

export function formatBoardingPassAsText(passes: BoardingPass[]): string {
  const blocks = passes.map((pass, index) => {
    const lines = [
      index === 0 ? 'AeroBook Boarding Pass' : '',
      index === 0 ? '======================' : '----------------------',
      `Passenger: ${pass.passengerName}`,
      `Booking reference: ${pass.bookingReference}`,
      `Flight: ${pass.flightNumber}`,
      `Origin: ${pass.originCode} (${pass.originCity})`,
      `Destination: ${pass.destinationCode} (${pass.destinationCity})`,
      `Date: ${pass.date}`,
      `Departure: ${pass.departureTime}`,
      `Boarding: ${pass.boardingTime}`,
      `Gate: ${pass.gate}`,
      `Terminal: ${pass.terminal}`,
      `Seat: ${pass.seat}`,
      `Boarding group: ${pass.boardingGroup}`,
      `Cabin: ${pass.cabinClass}`,
      `Scan id: ${pass.scanPayload}`,
    ].filter(Boolean);
    return lines.join('\n');
  });

  return [
    ...blocks,
    '',
    'This is a mock boarding pass for demo purposes only.',
  ].join('\n');
}
