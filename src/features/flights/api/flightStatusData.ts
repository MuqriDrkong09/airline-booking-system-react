import { MOCK_AIRPORTS } from './airportsData';
import { MOCK_AIRLINES } from '../constants/airlines';
import type { FlightAirline, FlightEndpoint } from '../types/flight';
import type {
  FlightOperationalStatus,
  FlightStatusLookupRequest,
  FlightStatusRecord,
} from '../types/flightStatus';
import { todayIsoDate } from '../utils/dates';

function hashSeed(input: string): number {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function addMinutes(isoLocal: string, minutes: number): string {
  const [datePart = '', timePart = '00:00'] = isoLocal.split('T');
  const [year = 0, month = 1, day = 1] = datePart.split('-').map(Number);
  const [hour = 0, minute = 0] = timePart.split(':').map(Number);
  const date = new Date(year, month - 1, day, hour, minute);
  date.setMinutes(date.getMinutes() + minutes);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function toEndpoint(code: string, terminal: string): FlightEndpoint {
  const airport = MOCK_AIRPORTS.find((item) => item.code.toUpperCase() === code.toUpperCase());
  return {
    code: (airport?.code ?? code).toUpperCase(),
    city: airport?.city ?? code.toUpperCase(),
    airportName: airport?.name ?? `${code.toUpperCase()} Airport`,
    terminal,
  };
}

/** Normalize flight numbers like `mh 123` → `MH123`. */
export function normalizeFlightNumber(value: string): string {
  return value.replace(/\s+/g, '').toUpperCase();
}

export function isValidFlightNumber(value: string): boolean {
  return /^[A-Z]{2,3}\d{1,4}$/.test(normalizeFlightNumber(value));
}

function resolveAirline(flightNumber: string): FlightAirline {
  const normalized = normalizeFlightNumber(flightNumber);
  const match = MOCK_AIRLINES.find((airline) => normalized.startsWith(airline.code));
  if (match) {
    return match;
  }
  const code = normalized.slice(0, 2);
  return { code, name: `${code} Airlines` };
}

function pickRoute(seed: number): { origin: string; destination: string } {
  const active = MOCK_AIRPORTS.filter((airport) => airport.active);
  const origin = active[seed % active.length]!;
  let destination = active[(seed * 7 + 3) % active.length]!;
  if (destination.code === origin.code) {
    destination = active[(seed + 1) % active.length]!;
  }
  return { origin: origin.code, destination: destination.code };
}

function scheduledTimes(date: string, seed: number): {
  departure: string;
  arrival: string;
} {
  const depHour = 6 + (seed % 14);
  const depMinute = (seed * 11) % 60;
  const durationMinutes = 75 + (seed % 10) * 25;
  const departure = `${date}T${pad(depHour)}:${pad(depMinute)}`;
  return {
    departure,
    arrival: addMinutes(departure, durationMinutes),
  };
}

/**
 * Derives a demo operational status from the flight date relative to today
 * and a deterministic seed (so the same lookup stays stable).
 */
export function resolveOperationalStatus(
  date: string,
  seed: number,
  nowIsoDate: string = todayIsoDate(),
): FlightOperationalStatus {
  if (seed % 17 === 0) {
    return 'CANCELLED';
  }

  if (date < nowIsoDate) {
    return seed % 5 === 0 ? 'CANCELLED' : 'ARRIVED';
  }

  if (date > nowIsoDate) {
    return seed % 9 === 0 ? 'DELAYED' : 'SCHEDULED';
  }

  // Same calendar day — cycle through active statuses.
  const sameDay: FlightOperationalStatus[] = [
    'SCHEDULED',
    'BOARDING',
    'DELAYED',
    'DEPARTED',
    'ARRIVED',
  ];
  return sameDay[seed % sameDay.length]!;
}

/**
 * Builds a deterministic flight status record for demo / mock mode.
 * Returns `null` for the empty fixture (`ZZ000`).
 */
export function generateMockFlightStatus(
  request: FlightStatusLookupRequest,
  options: { nowIsoDate?: string } = {},
): FlightStatusRecord | null {
  const flightNumber = normalizeFlightNumber(request.flightNumber);
  const date = request.date.trim();

  if (!flightNumber || !date) {
    return null;
  }

  // Empty fixture for UI/tests.
  if (flightNumber === 'ZZ000') {
    return null;
  }

  const seed = hashSeed(`${flightNumber}|${date}`);
  const airline = resolveAirline(flightNumber);
  const route = pickRoute(seed);
  const times = scheduledTimes(date, seed);
  const status = resolveOperationalStatus(date, seed, options.nowIsoDate ?? todayIsoDate());
  const delayMinutes = status === 'DELAYED' ? 20 + (seed % 70) : 0;
  const originTerminal = String((seed % 3) + 1);
  const gate =
    status === 'CANCELLED' ? '—' : String((seed % 28) + 1);

  const origin = toEndpoint(route.origin, originTerminal);
  const destination = toEndpoint(route.destination, String((seed % 2) + 1));

  return {
    flightNumber,
    airline,
    origin,
    destination,
    scheduledDeparture: times.departure,
    estimatedDeparture: delayMinutes
      ? addMinutes(times.departure, delayMinutes)
      : times.departure,
    scheduledArrival: times.arrival,
    estimatedArrival: delayMinutes ? addMinutes(times.arrival, delayMinutes) : times.arrival,
    terminal: originTerminal,
    gate,
    status,
    date,
  };
}
