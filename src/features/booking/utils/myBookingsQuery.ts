import type { Booking } from '../types/bookingRecord';
import { getBookingTab, type MyBookingsTab } from './bookingStatus';

export const MY_BOOKINGS_PAGE_SIZE = 5;

export type MyBookingsSort = 'departure_asc' | 'departure_desc' | 'newest';

export interface MyBookingsQuery {
  tab: MyBookingsTab;
  search: string;
  sort: MyBookingsSort;
  page: number;
  pageSize?: number;
  todayIso: string;
}

export interface MyBookingsQueryResult {
  items: Booking[];
  total: number;
  page: number;
  pageCount: number;
  counts: Record<MyBookingsTab, number>;
}

function normalizeSearch(value: string): string {
  return value.trim().toLowerCase();
}

function matchesSearch(booking: Booking, search: string): boolean {
  if (!search) {
    return true;
  }

  const { flight } = booking;
  const haystack = [
    booking.reference,
    booking.status,
    flight.airline.name,
    flight.airline.code,
    flight.flightNumber,
    flight.origin.code,
    flight.origin.city,
    flight.destination.code,
    flight.destination.city,
    `${flight.origin.code} ${flight.destination.code}`,
    `${flight.origin.code}-${flight.destination.code}`,
  ]
    .join(' ')
    .toLowerCase();

  return haystack.includes(search);
}

function departureSortKey(booking: Booking): string {
  return booking.flight.departureTime;
}

function sortBookings(bookings: Booking[], sort: MyBookingsSort): Booking[] {
  const copy = [...bookings];

  copy.sort((a, b) => {
    if (sort === 'newest') {
      return b.createdAt.localeCompare(a.createdAt);
    }
    if (sort === 'departure_asc') {
      return departureSortKey(a).localeCompare(departureSortKey(b));
    }
    return departureSortKey(b).localeCompare(departureSortKey(a));
  });

  return copy;
}

export function countBookingsByTab(
  bookings: Booking[],
  todayIso: string,
): Record<MyBookingsTab, number> {
  const counts: Record<MyBookingsTab, number> = {
    upcoming: 0,
    past: 0,
    cancelled: 0,
  };

  for (const booking of bookings) {
    counts[getBookingTab(booking, todayIso)] += 1;
  }

  return counts;
}

export function queryMyBookings(
  bookings: Booking[],
  query: MyBookingsQuery,
): MyBookingsQueryResult {
  const search = normalizeSearch(query.search);
  const pageSize = query.pageSize ?? MY_BOOKINGS_PAGE_SIZE;
  const counts = countBookingsByTab(bookings, query.todayIso);

  const filtered = sortBookings(
    bookings.filter(
      (booking) =>
        getBookingTab(booking, query.todayIso) === query.tab && matchesSearch(booking, search),
    ),
    query.sort,
  );

  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(Math.max(1, query.page), pageCount);
  const start = (page - 1) * pageSize;

  return {
    items: filtered.slice(start, start + pageSize),
    total,
    page,
    pageCount,
    counts,
  };
}
