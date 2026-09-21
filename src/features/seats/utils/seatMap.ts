import {
  BUSINESS_LAYOUT,
  ECONOMY_LAYOUT,
  FIRST_LAYOUT,
  PREMIUM_ECONOMY_LAYOUT,
} from '../constants/seat';
import type { Seat, SeatClass, SeatRowModel } from '../types/seat';

const LAYOUT_BY_CLASS: Readonly<Record<SeatClass, readonly string[]>> = {
  FIRST: FIRST_LAYOUT,
  BUSINESS: BUSINESS_LAYOUT,
  PREMIUM_ECONOMY: PREMIUM_ECONOMY_LAYOUT,
  ECONOMY: ECONOMY_LAYOUT,
};

export function groupSeatsIntoRows(seats: Seat[]): SeatRowModel[] {
  const byRow = new Map<number, Seat[]>();

  for (const seat of seats) {
    const list = byRow.get(seat.row) ?? [];
    list.push(seat);
    byRow.set(seat.row, list);
  }

  return Array.from(byRow.entries())
    .sort(([left], [right]) => left - right)
    .map(([row, rowSeats]) => {
      const sorted = [...rowSeats].sort((a, b) => a.column.localeCompare(b.column));
      const seatClass = sorted[0]?.class ?? 'ECONOMY';
      return {
        row,
        class: seatClass,
        seats: sorted,
        layout: [...LAYOUT_BY_CLASS[seatClass]],
      };
    });
}

export function formatSeatPrice(price: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

export function passengerDisplayName(firstName: string, lastName: string, fallback: string): string {
  const name = `${firstName} ${lastName}`.trim();
  return name || fallback;
}
