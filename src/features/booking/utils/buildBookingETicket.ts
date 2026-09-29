import { formatCabinLabel } from '@/features/flights';
import type { Booking } from '../types/bookingRecord';
import type { BookingETicket } from '../types/eticket';

/** Prefix used so scanners can recognize AeroBook tickets without embedding PII. */
export const ETICKET_QR_PREFIX = 'AEROBOOK';

/**
 * Builds a QR payload that contains only a safe booking identifier.
 * Never encode passenger name, email, passport, seat, or payment data.
 */
export function buildETicketQrPayload(bookingReference: string): string {
  const ref = bookingReference.trim().toUpperCase();
  return `${ETICKET_QR_PREFIX}:${ref}`;
}

export function parseETicketQrPayload(payload: string): string | null {
  const trimmed = payload.trim();
  const prefix = `${ETICKET_QR_PREFIX}:`;
  if (!trimmed.startsWith(prefix)) {
    return null;
  }
  const reference = trimmed.slice(prefix.length).trim();
  return reference || null;
}

function splitLocalDateTime(isoLocal: string): { date: string; time: string } {
  const [date = '', timePart = ''] = isoLocal.split('T');
  return {
    date,
    time: timePart.slice(0, 5) || isoLocal,
  };
}

/** Boarding typically opens ~45 minutes before departure for this demo. */
function boardingOpenTime(departureIso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(departureIso);
  if (!match) {
    return departureIso;
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
  date.setUTCMinutes(date.getUTCMinutes() - 45);
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}T${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}`;
}

function passengerDisplayName(
  title: string,
  firstName: string,
  lastName: string,
): string {
  return `${title} ${firstName} ${lastName}`.trim();
}

/**
 * Builds printable e-tickets (one per passenger) from a persisted booking.
 */
export function buildBookingETickets(booking: Booking): BookingETicket[] {
  const { flight } = booking;
  const departure = splitLocalDateTime(flight.departureTime);
  const arrival = splitLocalDateTime(flight.arrivalTime);
  const qrPayload = buildETicketQrPayload(booking.reference);
  const boardingTime = boardingOpenTime(flight.departureTime);
  const terminal = flight.origin.terminal?.trim() || 'See airport screens';
  const gate = 'TBA — check airport screens';

  return booking.passengers.map((passenger) => {
    const seat =
      booking.seats.find((item) => item.passengerId === passenger.id)?.label ??
      'Not assigned';

    return {
      bookingReference: booking.reference,
      passengerName: passengerDisplayName(
        passenger.title,
        passenger.firstName,
        passenger.lastName,
      ),
      passengerId: passenger.id,
      airline: flight.airline.name,
      airlineCode: flight.airline.code,
      flightNumber: flight.flightNumber,
      originCode: flight.origin.code,
      originCity: flight.origin.city,
      originAirport: flight.origin.airportName,
      destinationCode: flight.destination.code,
      destinationCity: flight.destination.city,
      destinationAirport: flight.destination.airportName,
      departureDate: departure.date,
      departureTime: departure.time,
      arrivalTime: arrival.time,
      seat,
      cabinClass: formatCabinLabel(booking.cabinClass),
      boarding: {
        boardingTime,
        gate,
        terminal,
        instructions:
          'Arrive at the gate before boarding opens. Have this e-ticket and a valid ID ready.',
      },
      qrPayload,
    };
  });
}

export function formatETicketAsText(tickets: BookingETicket[]): string {
  const blocks = tickets.map((ticket, index) => {
    const lines = [
      index === 0 ? 'AeroBook E-Ticket' : '',
      index === 0 ? '=================' : '-----------------',
      `Passenger: ${ticket.passengerName}`,
      `Booking reference: ${ticket.bookingReference}`,
      `Airline: ${ticket.airline}`,
      `Flight: ${ticket.flightNumber}`,
      `Origin: ${ticket.originCode} (${ticket.originCity})`,
      `Destination: ${ticket.destinationCode} (${ticket.destinationCity})`,
      `Departure date: ${ticket.departureDate}`,
      `Departure time: ${ticket.departureTime}`,
      `Arrival time: ${ticket.arrivalTime}`,
      `Seat: ${ticket.seat}`,
      `Cabin: ${ticket.cabinClass}`,
      '',
      'Boarding',
      `  Opens: ${ticket.boarding.boardingTime}`,
      `  Gate: ${ticket.boarding.gate}`,
      `  Terminal: ${ticket.boarding.terminal}`,
      `  ${ticket.boarding.instructions}`,
      '',
      `QR (safe id only): ${ticket.qrPayload}`,
    ].filter(Boolean);
    return lines.join('\n');
  });

  return [...blocks, '', 'This is a mock e-ticket for demo purposes only.'].join(
    '\n',
  );
}
