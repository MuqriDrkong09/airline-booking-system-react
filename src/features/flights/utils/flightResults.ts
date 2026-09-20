import type { FlightFilterState, FlightOffer, FlightSortOption } from '../types/flight';

export const DEFAULT_FLIGHT_FILTERS: FlightFilterState = {
  stops: [],
  airlines: [],
  maxPrice: null,
  minSeats: null,
};

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) {
    return `${mins}m`;
  }
  if (mins === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${mins}m`;
}

export function formatFlightTime(isoLocal: string): string {
  const timePart = isoLocal.includes('T') ? (isoLocal.split('T')[1] ?? isoLocal) : isoLocal;
  const [hours = '00', minutes = '00'] = timePart.split(':');
  return `${hours}:${minutes}`;
}

export function formatFlightDate(isoLocal: string): string {
  const datePart = isoLocal.includes('T') ? (isoLocal.split('T')[0] ?? isoLocal) : isoLocal;
  const [year = 1970, month = 1, day = 1] = datePart.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

export function formatPrice(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(0)}`;
  }
}

export function formatStopsLabel(stops: number, stopAirports: string[] = []): string {
  if (stops <= 0) {
    return 'Nonstop';
  }
  if (stops === 1) {
    return stopAirports[0] ? `1 stop (${stopAirports[0]})` : '1 stop';
  }
  const via = stopAirports.length ? ` (${stopAirports.join(', ')})` : '';
  return `${stops} stops${via}`;
}

export function filterFlightOffers(
  flights: FlightOffer[],
  filters: FlightFilterState,
): FlightOffer[] {
  return flights.filter((flight) => {
    if (filters.stops.length > 0) {
      const bucket = flight.stops >= 2 ? 2 : (flight.stops as 0 | 1);
      if (!filters.stops.includes(bucket)) {
        return false;
      }
    }

    if (filters.airlines.length > 0 && !filters.airlines.includes(flight.airline.code)) {
      return false;
    }

    if (filters.maxPrice !== null && flight.price.amount > filters.maxPrice) {
      return false;
    }

    if (filters.minSeats !== null && flight.availableSeats < filters.minSeats) {
      return false;
    }

    return true;
  });
}

export function sortFlightOffers(
  flights: FlightOffer[],
  sort: FlightSortOption,
): FlightOffer[] {
  const next = [...flights];

  next.sort((left, right) => {
    switch (sort) {
      case 'price_desc':
        return right.price.amount - left.price.amount;
      case 'duration_asc':
        return left.durationMinutes - right.durationMinutes;
      case 'departure_asc':
        return left.departureTime.localeCompare(right.departureTime);
      case 'arrival_asc':
        return left.arrivalTime.localeCompare(right.arrivalTime);
      case 'price_asc':
      default:
        return left.price.amount - right.price.amount;
    }
  });

  return next;
}

export function getAirlineOptions(flights: FlightOffer[]): Array<{ code: string; name: string }> {
  const map = new Map<string, string>();
  flights.forEach((flight) => {
    map.set(flight.airline.code, flight.airline.name);
  });
  return [...map.entries()]
    .map(([code, name]) => ({ code, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getMaxPriceCeiling(flights: FlightOffer[]): number {
  if (flights.length === 0) {
    return 0;
  }
  return Math.max(...flights.map((flight) => flight.price.amount));
}
