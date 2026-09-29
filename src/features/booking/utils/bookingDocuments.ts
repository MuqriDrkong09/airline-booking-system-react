import type { Booking } from '../types/bookingRecord';
import {
  buildBookingETickets,
  formatETicketAsText,
} from './buildBookingETicket';
import { buildBookingInvoice, formatInvoiceAsText } from './buildBookingInvoice';

export function buildETicketText(booking: Booking): string {
  return formatETicketAsText(buildBookingETickets(booking));
}

export function buildInvoiceText(booking: Booking): string {
  return formatInvoiceAsText(buildBookingInvoice(booking));
}

export function downloadTextFile(filename: string, contents: string, mime = 'text/plain'): void {
  const blob = new Blob([contents], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

/** Convert local-ish ISO `YYYY-MM-DDTHH:mm` to ICS local date-time. */
function toIcsDateTime(isoLocal: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(isoLocal);
  if (!match) {
    return isoLocal.replace(/[-:]/g, '').replace('T', '');
  }
  const [, year, month, day, hour, minute] = match;
  return `${year}${month}${day}T${hour}${minute}00`;
}

export function buildCalendarIcs(booking: Booking): string {
  const { flight } = booking;
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  const summary = `${flight.airline.code}${flight.flightNumber} ${flight.origin.code}→${flight.destination.code}`;
  const description = `AeroBook booking ${booking.reference}\\nStatus ${booking.status}`;

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//AeroBook//Booking//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${booking.reference}@aerobook.local`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${toIcsDateTime(flight.departureTime)}`,
    `DTEND:${toIcsDateTime(flight.arrivalTime)}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${flight.origin.airportName} (${flight.origin.code})`,
    'END:VEVENT',
    'END:VCALENDAR',
    '',
  ].join('\r\n');
}

export function downloadCalendarEvent(booking: Booking): void {
  downloadTextFile(
    `aerobook-${booking.reference}.ics`,
    buildCalendarIcs(booking),
    'text/calendar',
  );
}
