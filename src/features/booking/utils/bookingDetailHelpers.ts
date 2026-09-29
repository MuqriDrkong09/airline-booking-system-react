import type { Booking, BookingPassenger } from '../types/bookingRecord';

export function formatPassengerLabel(passenger: BookingPassenger): string {
  const name = `${passenger.title} ${passenger.firstName} ${passenger.lastName}`.trim();
  return name || passenger.id;
}

export function passengerNameById(booking: Booking): Map<string, string> {
  return new Map(
    booking.passengers.map((passenger) => [passenger.id, formatPassengerLabel(passenger)]),
  );
}

export function formatBookingTimestamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }

  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  } catch {
    return iso;
  }
}

/** Loose booking-reference shape used for client-side validation. */
export function isValidBookingReference(reference: string): boolean {
  const trimmed = reference.trim();
  return trimmed.length >= 4 && /^[A-Za-z0-9-]+$/.test(trimmed);
}
