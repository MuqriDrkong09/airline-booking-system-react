import type { CabinClass } from '../types';
import type {
  FlightFilterBounds,
  FlightFilterState,
  FlightOffer,
  FlightSortOption,
} from '../types/flight';
import { DEFAULT_FLIGHT_FILTERS } from './filterParams';

export { DEFAULT_FLIGHT_FILTERS } from './filterParams';

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

export function getHourOfDay(isoLocal: string): number {
  const timePart = isoLocal.includes('T') ? (isoLocal.split('T')[1] ?? '0:0') : '0:0';
  const [hoursText = '0'] = timePart.split(':');
  return Number.parseInt(hoursText, 10) || 0;
}

function matchesHourRange(
  hour: number,
  start: number | null,
  end: number | null,
): boolean {
  if (start !== null && hour < start) {
    return false;
  }
  if (end !== null && hour > end) {
    return false;
  }
  return true;
}

export function filterFlightOffers(
  flights: FlightOffer[],
  filters: FlightFilterState,
): FlightOffer[] {
  return flights.filter((flight) => {
    if (filters.priceMin !== null && flight.price.amount < filters.priceMin) {
      return false;
    }
    if (filters.priceMax !== null && flight.price.amount > filters.priceMax) {
      return false;
    }

    if (filters.airlines.length > 0 && !filters.airlines.includes(flight.airline.code)) {
      return false;
    }

    if (filters.stops.length > 0) {
      const bucket = flight.stops >= 2 ? 2 : (flight.stops as 0 | 1);
      if (!filters.stops.includes(bucket)) {
        return false;
      }
    }

    const departureHour = getHourOfDay(flight.departureTime);
    if (!matchesHourRange(departureHour, filters.departureHourStart, filters.departureHourEnd)) {
      return false;
    }

    const arrivalHour = getHourOfDay(flight.arrivalTime);
    if (!matchesHourRange(arrivalHour, filters.arrivalHourStart, filters.arrivalHourEnd)) {
      return false;
    }

    if (filters.durationMax !== null && flight.durationMinutes > filters.durationMax) {
      return false;
    }

    if (
      filters.cabinClasses.length > 0 &&
      !filters.cabinClasses.includes(flight.cabinClass)
    ) {
      return false;
    }

    if (filters.refundableOnly && !flight.refundable) {
      return false;
    }

    if (filters.baggageIncludedOnly && !flight.baggageIncluded) {
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

export function getCabinOptions(flights: FlightOffer[]): CabinClass[] {
  return [...new Set(flights.map((flight) => flight.cabinClass))];
}

export function getFilterBounds(flights: FlightOffer[]): FlightFilterBounds {
  if (flights.length === 0) {
    return { priceMin: 0, priceMax: 0, durationMax: 0 };
  }

  return {
    priceMin: Math.min(...flights.map((flight) => flight.price.amount)),
    priceMax: Math.max(...flights.map((flight) => flight.price.amount)),
    durationMax: Math.max(...flights.map((flight) => flight.durationMinutes)),
  };
}

/** @deprecated Prefer getFilterBounds().priceMax */
export function getMaxPriceCeiling(flights: FlightOffer[]): number {
  return getFilterBounds(flights).priceMax;
}

export function createDefaultFiltersForBounds(bounds: FlightFilterBounds): FlightFilterState {
  return {
    ...DEFAULT_FLIGHT_FILTERS,
    priceMin: bounds.priceMin,
    priceMax: bounds.priceMax,
    departureHourStart: 0,
    departureHourEnd: 24,
    arrivalHourStart: 0,
    arrivalHourEnd: 24,
    durationMax: bounds.durationMax,
  };
}

export function formatHourLabel(hour: number): string {
  const clamped = Math.max(0, Math.min(24, hour));
  if (clamped === 24) {
    return '24:00';
  }
  return `${String(clamped).padStart(2, '0')}:00`;
}
