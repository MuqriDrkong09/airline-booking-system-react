import { MOCK_AIRPORTS } from '../api/airportsData';
import { MOCK_AIRLINES } from '../constants/airlines';
import type { CabinClass } from '../types';
import type { FlightOffer, FlightSearchRequest } from '../types/flight';

function hashSeed(input: string): number {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
}

function pickAirport(code: string) {
  return MOCK_AIRPORTS.find((airport) => airport.code.toUpperCase() === code.toUpperCase());
}

function addMinutes(isoLocal: string, minutes: number): string {
  const [datePart = '', timePart = '00:00'] = isoLocal.split('T');
  const [year = 0, month = 1, day = 1] = datePart.split('-').map(Number);
  const [hour = 0, minute = 0] = timePart.split(':').map(Number);
  const date = new Date(year, month - 1, day, hour, minute);
  date.setMinutes(date.getMinutes() + minutes);
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function cabinMultiplier(cabin: CabinClass): number {
  switch (cabin) {
    case 'PREMIUM_ECONOMY':
      return 1.45;
    case 'BUSINESS':
      return 2.6;
    case 'FIRST':
      return 4.1;
    default:
      return 1;
  }
}

function baggageForCabin(cabin: CabinClass) {
  switch (cabin) {
    case 'FIRST':
      return { cabinKg: 12, checkedKg: 40, pieces: 2 };
    case 'BUSINESS':
      return { cabinKg: 10, checkedKg: 32, pieces: 2 };
    case 'PREMIUM_ECONOMY':
      return { cabinKg: 10, checkedKg: 25, pieces: 1 };
    default:
      return { cabinKg: 7, checkedKg: 20, pieces: 1 };
  }
}

const STOPOVER_BY_ROUTE: Record<string, string[]> = {
  'KUL-NRT': ['BKK', 'HKG', 'ICN'],
  'NRT-KUL': ['HKG', 'ICN', 'BKK'],
  'KUL-SIN': [],
  'SIN-KUL': [],
  'SIN-NRT': ['HKG'],
  'NRT-SIN': ['HKG'],
};

/**
 * Deterministic mock flight generator for search results.
 * Returns an empty list for unknown airports or the special ZZZ destination.
 */
export function generateMockFlightOffers(request: FlightSearchRequest): FlightOffer[] {
  const from = request.from.trim().toUpperCase();
  const to = request.to.trim().toUpperCase();

  if (!from || !to || from === to) {
    return [];
  }

  // Explicit empty fixture for tests / demos.
  if (to === 'ZZZ' || from === 'ZZZ') {
    return [];
  }

  const origin = pickAirport(from);
  const destination = pickAirport(to);
  if (!origin || !destination) {
    return [];
  }

  const seed = hashSeed(
    `${from}-${to}-${request.departure}-${request.cabinClass}-${request.adults}`,
  );
  const routeKey = `${from}-${to}`;
  const stopOptions = STOPOVER_BY_ROUTE[routeKey] ?? ['BKK', 'SIN', 'HKG'];
  const offerCount = 5 + (seed % 4);
  const passengers = Math.max(1, request.adults + request.children);
  const offers: FlightOffer[] = [];

  for (let index = 0; index < offerCount; index += 1) {
    const airline = MOCK_AIRLINES[(seed + index) % MOCK_AIRLINES.length]!;
    const departHour = 6 + ((seed + index * 3) % 14);
    const departMinute = ((seed + index * 7) % 4) * 15;
    const pad = (value: number) => String(value).padStart(2, '0');
    const departureTime = `${request.departure}T${pad(departHour)}:${pad(departMinute)}`;

    const stops = index % 3 === 0 ? 0 : index % 3 === 1 ? 1 : 2;
    const stopAirports =
      stops === 0
        ? []
        : stopOptions.slice(0, stops).map((code) => code.toUpperCase()).filter((code) => code !== from && code !== to);

    const baseDuration = 90 + ((seed + index * 11) % 120) + stops * 75;
    const durationMinutes = baseDuration + (from === 'KUL' && to === 'NRT' ? 300 : 0);
    const arrivalTime = addMinutes(departureTime, durationMinutes);
    const basePrice = 180 + ((seed + index * 17) % 420) + stops * 35;
    const availableSeats = Math.max(1, 3 + ((seed + index * 5) % 12));
    const cabinOptions: CabinClass[] = [
      request.cabinClass,
      'ECONOMY',
      'PREMIUM_ECONOMY',
      'BUSINESS',
      'FIRST',
    ];
    const cabinClass = cabinOptions[(seed + index) % cabinOptions.length]!;
    const baggage =
      index % 5 === 0
        ? { cabinKg: 7, checkedKg: 0, pieces: 0 }
        : baggageForCabin(cabinClass);
    const baggageIncluded = baggage.checkedKg > 0;
    const refundable = (seed + index) % 2 === 0;

    offers.push({
      id: `flt-${from}-${to}-${request.departure}-${index + 1}`,
      airline,
      flightNumber: `${airline.code}${100 + ((seed + index * 13) % 800)}`,
      origin: {
        code: origin.code,
        city: origin.city,
        airportName: origin.name,
      },
      destination: {
        code: destination.code,
        city: destination.city,
        airportName: destination.name,
      },
      departureTime,
      arrivalTime,
      durationMinutes,
      stops: stopAirports.length,
      stopAirports,
      cabinClass,
      baggage,
      price: {
        amount: Math.round(basePrice * cabinMultiplier(cabinClass) * passengers),
        currency: 'MYR',
      },
      availableSeats,
      refundable,
      baggageIncluded,
    });
  }

  return offers;
}
