import type { Booking } from '../types/bookingRecord';
import { formatBookingMoney } from './formatMoney';

function passengerName(booking: Booking, passengerId: string): string {
  const passenger = booking.passengers.find((item) => item.id === passengerId);
  if (!passenger) {
    return passengerId;
  }
  const name = `${passenger.firstName} ${passenger.lastName}`.trim();
  return name || passengerId;
}

export function buildETicketText(booking: Booking): string {
  const { flight, priceBreakdown } = booking;
  const lines = [
    'AeroBook E-Ticket',
    '=================',
    `Booking reference: ${booking.reference}`,
    `Status: ${booking.status}`,
    `Transaction: ${booking.transactionId}`,
    '',
    'Flight',
    `  ${flight.airline.name} ${flight.flightNumber}`,
    `  ${flight.origin.code} (${flight.origin.city}) → ${flight.destination.code} (${flight.destination.city})`,
    `  Departs ${flight.departureTime} · Arrives ${flight.arrivalTime}`,
    '',
    'Passengers',
    ...booking.passengers.map(
      (passenger, index) =>
        `  ${index + 1}. ${passenger.title} ${passenger.firstName} ${passenger.lastName} (${passenger.type})`,
    ),
    '',
    'Seats',
    ...(booking.seats.length
      ? booking.seats.map(
          (seat) => `  ${seat.label} — ${passengerName(booking, seat.passengerId)}`,
        )
      : ['  None assigned']),
    '',
    `Total paid: ${formatBookingMoney(priceBreakdown.finalTotal, priceBreakdown.currency)}`,
    '',
    'This is a mock e-ticket for demo purposes only.',
  ];
  return lines.join('\n');
}

export function buildInvoiceText(booking: Booking): string {
  const { priceBreakdown, payment } = booking;
  const lines = [
    'AeroBook Invoice',
    '================',
    `Invoice for booking ${booking.reference}`,
    `Issued: ${booking.createdAt}`,
    `Status: ${booking.status}`,
    '',
    'Bill to',
    `  ${payment.billingName || 'Passenger'}`,
    `  ${payment.billingEmail || '—'}`,
    '',
    'Charges',
    `  Fare: ${formatBookingMoney(priceBreakdown.baseFare, priceBreakdown.currency)}`,
    `  Seats: ${formatBookingMoney(priceBreakdown.seatCost, priceBreakdown.currency)}`,
    `  Baggage: ${formatBookingMoney(priceBreakdown.baggageCost, priceBreakdown.currency)}`,
    `  Meals: ${formatBookingMoney(priceBreakdown.mealCost, priceBreakdown.currency)}`,
    `  Add-ons: ${formatBookingMoney(priceBreakdown.addonCost, priceBreakdown.currency)}`,
    `  Subtotal: ${formatBookingMoney(priceBreakdown.subtotal, priceBreakdown.currency)}`,
    `  Discount: ${formatBookingMoney(priceBreakdown.discount, priceBreakdown.currency)}`,
    `  Taxes: ${formatBookingMoney(priceBreakdown.taxes, priceBreakdown.currency)}`,
    `  Total: ${formatBookingMoney(priceBreakdown.finalTotal, priceBreakdown.currency)}`,
    '',
    `Payment method: ${payment.method ?? '—'}`,
    payment.cardLast4 ? `Card: ${payment.cardBrand} •••• ${payment.cardLast4}` : '',
    '',
    'This is a mock invoice for demo purposes only.',
  ].filter(Boolean);
  return lines.join('\n');
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
