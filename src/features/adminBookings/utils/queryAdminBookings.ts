import { getBookingDepartureDate } from '@/features/booking';
import type {
  AdminBooking,
  AdminBookingListQuery,
  AdminBookingListResult,
  AdminBookingSortField,
} from '../types/adminBooking';

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function matchesSearch(booking: AdminBooking, search: string): boolean {
  if (!search) {
    return true;
  }

  const { flight } = booking;
  const primary = booking.passengers[0];
  const haystack = [
    booking.reference,
    booking.status,
    booking.id,
    flight.flightNumber,
    flight.airline.code,
    flight.airline.name,
    flight.origin.code,
    flight.origin.city,
    flight.destination.code,
    flight.destination.city,
    primary?.firstName,
    primary?.lastName,
    primary?.email,
  ]
    .join(' ')
    .toLowerCase();

  return haystack.includes(search);
}

function sortValue(booking: AdminBooking, sortBy: AdminBookingSortField): string | number {
  switch (sortBy) {
    case 'reference':
      return booking.reference;
    case 'status':
      return booking.status;
    case 'departure':
      return booking.flight.departureTime;
    case 'createdAt':
      return booking.createdAt;
    case 'total':
      return booking.priceBreakdown.finalTotal;
    case 'flight':
      return booking.flight.flightNumber;
    default:
      return booking.createdAt;
  }
}

export function filterAdminBookings(
  bookings: readonly AdminBooking[],
  query: Pick<AdminBookingListQuery, 'search' | 'status' | 'dateFrom' | 'dateTo' | 'flight'>,
): AdminBooking[] {
  const search = normalize(query.search);
  const flight = normalize(query.flight);

  return bookings.filter((booking) => {
    if (query.status && booking.status !== query.status) {
      return false;
    }

    if (flight && !booking.flight.flightNumber.toLowerCase().includes(flight)) {
      return false;
    }

    const departureDate = getBookingDepartureDate(booking);
    if (query.dateFrom && departureDate < query.dateFrom) {
      return false;
    }
    if (query.dateTo && departureDate > query.dateTo) {
      return false;
    }

    return matchesSearch(booking, search);
  });
}

export function sortAdminBookings(
  bookings: readonly AdminBooking[],
  sortBy: AdminBookingListQuery['sortBy'],
  sortDir: AdminBookingListQuery['sortDir'],
): AdminBooking[] {
  const direction = sortDir === 'asc' ? 1 : -1;
  return [...bookings].sort((left, right) => {
    const leftValue = sortValue(left, sortBy);
    const rightValue = sortValue(right, sortBy);
    if (typeof leftValue === 'number' && typeof rightValue === 'number') {
      return (leftValue - rightValue) * direction;
    }
    return String(leftValue).localeCompare(String(rightValue)) * direction;
  });
}

export function queryAdminBookings(
  bookings: readonly AdminBooking[],
  query: AdminBookingListQuery,
): AdminBookingListResult {
  const filtered = sortAdminBookings(filterAdminBookings(bookings, query), query.sortBy, query.sortDir);
  const total = filtered.length;
  const pageSize = Math.max(1, query.pageSize);
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(Math.max(1, query.page), pageCount);
  const start = (page - 1) * pageSize;

  return {
    items: filtered.slice(start, start + pageSize),
    total,
    page,
    pageSize,
    pageCount,
  };
}
