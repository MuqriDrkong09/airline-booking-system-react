import { MOCK_AIRPORTS } from '../api/airportsData';
import { MOCK_AIRLINES } from '../constants/airlines';
import type { CabinClass } from '../types';
import type {
  FlightAircraft,
  FlightAmenities,
  FlightEndpoint,
  FlightFarePolicies,
  FlightOffer,
  FlightOfferSegment,
  FlightSearchRequest,
} from '../types/flight';

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

const AIRCRAFT_MODELS = [
  'Boeing 737-800',
  'Airbus A350-900',
  'Boeing 787-9',
  'Airbus A330-300',
  'Airbus A321neo',
] as const;

const STOPOVER_BY_ROUTE: Record<string, string[]> = {
  'KUL-NRT': ['BKK', 'HKG', 'ICN'],
  'NRT-KUL': ['HKG', 'ICN', 'BKK'],
  'KUL-SIN': [],
  'SIN-KUL': [],
  'SIN-NRT': ['HKG'],
  'NRT-SIN': ['HKG'],
};

function toEndpoint(
  code: string,
  terminal: string,
  fallback?: { city: string; name: string },
): FlightEndpoint {
  const airport = pickAirport(code);
  return {
    code: (airport?.code ?? code).toUpperCase(),
    city: airport?.city ?? fallback?.city ?? code.toUpperCase(),
    airportName: airport?.name ?? fallback?.name ?? `${code.toUpperCase()} Airport`,
    terminal,
  };
}

function aircraftForSeed(seed: number, index: number): FlightAircraft {
  const model = AIRCRAFT_MODELS[(seed + index) % AIRCRAFT_MODELS.length]!;
  const registration = `${['9M', '9V', 'JA', 'B'][(seed + index) % 4]}-${String(
    100 + ((seed + index * 17) % 900),
  )}`;
  return { model, registration };
}

function amenitiesForCabin(cabin: CabinClass, seed: number, index: number): FlightAmenities {
  const wifi = (seed + index) % 3 !== 0;
  switch (cabin) {
    case 'FIRST':
      return {
        meals: 'Multi-course chef menu with premium wines',
        wifi: true,
        wifiNotes: 'Complimentary high-speed Wi-Fi',
        seatInformation: 'Fully flat suite · direct aisle access · 78–82" pitch',
      };
    case 'BUSINESS':
      return {
        meals: 'Multi-course meal with complimentary drinks',
        wifi: true,
        wifiNotes: 'Complimentary Wi-Fi',
        seatInformation: 'Lie-flat seat · 60–78" pitch · privacy divider',
      };
    case 'PREMIUM_ECONOMY':
      return {
        meals: 'Enhanced meal service with snack',
        wifi,
        wifiNotes: wifi ? 'Complimentary messaging; streaming available for purchase' : 'Wi-Fi unavailable on this aircraft',
        seatInformation: 'Recliner seat · 38–40" pitch · footrest',
      };
    default:
      return {
        meals: (seed + index) % 2 === 0 ? 'Hot meal and soft drinks' : 'Light snack and soft drinks',
        wifi,
        wifiNotes: wifi ? 'Wi-Fi available for purchase' : 'Wi-Fi unavailable on this aircraft',
        seatInformation: 'Standard seat · 30–32" pitch · seat selection at check-in',
      };
  }
}

function policiesForOffer(refundable: boolean, cabin: CabinClass): FlightFarePolicies {
  if (refundable) {
    return {
      refundPolicy:
        cabin === 'ECONOMY'
          ? 'Refundable before departure with a MYR 150 fee per passenger.'
          : 'Fully refundable before departure with no cancellation fee.',
      changePolicy: 'Date and time changes allowed before departure; fare difference may apply.',
      fareConditions: [
        'Ticket is refundable subject to the refund policy above.',
        'Name changes are not permitted after ticketing.',
        'No-show may forfeit the fare residual value.',
        'Taxes and carrier-imposed fees follow the airline’s published rules.',
      ],
    };
  }

  return {
    refundPolicy: 'Non-refundable. Unused taxes may be reclaimable after departure date.',
    changePolicy: 'Changes permitted up to 24 hours before departure with a change fee plus fare difference.',
    fareConditions: [
      'Fare is non-refundable except where required by law.',
      'Same-day standby may be available for a fee, subject to seat availability.',
      'Stopovers and open-jaw itineraries are not included in this fare.',
      'Baggage fees apply when checked baggage is not included.',
    ],
  };
}

function buildSegments(params: {
  offerId: string;
  airline: FlightOffer['airline'];
  flightNumber: string;
  aircraft: FlightAircraft;
  origin: FlightEndpoint;
  destination: FlightEndpoint;
  departureTime: string;
  arrivalTime: string;
  durationMinutes: number;
  stopAirports: string[];
  seed: number;
  index: number;
}): FlightOfferSegment[] {
  const { stopAirports } = params;
  if (stopAirports.length === 0) {
    return [
      {
        id: `${params.offerId}-seg-1`,
        flightNumber: params.flightNumber,
        airline: params.airline,
        aircraft: params.aircraft,
        origin: params.origin,
        destination: params.destination,
        departureTime: params.departureTime,
        arrivalTime: params.arrivalTime,
        durationMinutes: params.durationMinutes,
      },
    ];
  }

  const points = [params.origin.code, ...stopAirports, params.destination.code];
  const legCount = points.length - 1;
  const flyingMinutes = Math.max(45, params.durationMinutes - stopAirports.length * 60);
  const legDuration = Math.floor(flyingMinutes / legCount);
  const segments: FlightOfferSegment[] = [];
  let cursor = params.departureTime;

  for (let leg = 0; leg < legCount; leg += 1) {
    const fromCode = points[leg]!;
    const toCode = points[leg + 1]!;
    const isFirst = leg === 0;
    const isLast = leg === legCount - 1;
    const duration = isLast
      ? Math.max(40, params.durationMinutes - leg * (legDuration + 60) - (legCount - 1) * 60)
      : legDuration;
    const departureTime = cursor;
    const arrivalTime = addMinutes(departureTime, duration);
    const origin = isFirst
      ? params.origin
      : toEndpoint(fromCode, String(1 + ((params.seed + leg) % 3)));
    const destination = isLast
      ? params.destination
      : toEndpoint(toCode, String(1 + ((params.seed + leg + 1) % 3)));

    segments.push({
      id: `${params.offerId}-seg-${leg + 1}`,
      flightNumber: `${params.airline.code}${100 + ((params.seed + params.index * 13 + leg * 7) % 800)}`,
      airline: params.airline,
      aircraft: aircraftForSeed(params.seed, params.index + leg),
      origin,
      destination,
      departureTime,
      arrivalTime,
      durationMinutes: duration,
    });

    cursor = addMinutes(arrivalTime, 60);
  }

  return segments;
}

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

  const originAirport = pickAirport(from);
  const destinationAirport = pickAirport(to);
  if (!originAirport || !destinationAirport) {
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
        : stopOptions
            .slice(0, stops)
            .map((code) => code.toUpperCase())
            .filter((code) => code !== from && code !== to);

    const baseDuration = 90 + ((seed + index * 11) % 120) + stopAirports.length * 75;
    const durationMinutes = baseDuration + (from === 'KUL' && to === 'NRT' ? 300 : 0);
    const arrivalTime = addMinutes(departureTime, durationMinutes);
    const basePrice = 180 + ((seed + index * 17) % 420) + stopAirports.length * 35;
    const availableSeats = Math.max(1, 3 + ((seed + index * 5) % 12));
    const cabinOptions: CabinClass[] = [
      request.cabinClass,
      'ECONOMY',
      'PREMIUM_ECONOMY',
      'BUSINESS',
      'FIRST',
    ];
    const cabinClass = cabinOptions[(seed + index) % cabinOptions.length]!;
    const baggageBase =
      index % 5 === 0
        ? { cabinKg: 7, checkedKg: 0, pieces: 0 }
        : baggageForCabin(cabinClass);
    const baggageIncluded = baggageBase.checkedKg > 0;
    const refundable = (seed + index) % 2 === 0;
    const departureTerminal = String(1 + ((seed + index) % 3));
    const arrivalTerminal = String(1 + ((seed + index * 2) % 4));
    const origin = toEndpoint(from, departureTerminal, {
      city: originAirport.city,
      name: originAirport.name,
    });
    const destination = toEndpoint(to, arrivalTerminal, {
      city: destinationAirport.city,
      name: destinationAirport.name,
    });
    const aircraft = aircraftForSeed(seed, index);
    const flightNumber = `${airline.code}${100 + ((seed + index * 13) % 800)}`;
    const offerId = `flt-${from}-${to}-${request.departure}-${index + 1}`;
    const segments = buildSegments({
      offerId,
      airline,
      flightNumber,
      aircraft,
      origin,
      destination,
      departureTime,
      arrivalTime,
      durationMinutes,
      stopAirports,
      seed,
      index,
    });
    const amenities = amenitiesForCabin(cabinClass, seed, index);
    const policies = policiesForOffer(refundable, cabinClass);
    const baggage = {
      ...baggageBase,
      allowanceSummary: baggageIncluded
        ? `${baggageBase.pieces} checked piece${baggageBase.pieces === 1 ? '' : 's'} up to ${baggageBase.checkedKg}kg · ${baggageBase.cabinKg}kg cabin bag`
        : `Cabin bag only (${baggageBase.cabinKg}kg) · checked bags available for purchase`,
    };

    offers.push({
      id: offerId,
      airline,
      flightNumber,
      aircraft,
      origin,
      destination,
      departureTime,
      arrivalTime,
      durationMinutes,
      stops: stopAirports.length,
      stopAirports,
      cabinClass,
      baggage,
      amenities,
      policies,
      segments,
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

/**
 * Resolve a mock offer by id using the original search context when provided.
 * Falls back to common cabin/passenger combinations when context is incomplete.
 */
export function findMockFlightOfferById(
  flightId: string,
  context?: Partial<FlightSearchRequest> | null,
): FlightOffer | null {
  const id = flightId.trim();
  if (!id) {
    return null;
  }

  const match = /^flt-([A-Z0-9]+)-([A-Z0-9]+)-(\d{4}-\d{2}-\d{2})-(\d+)$/i.exec(id);
  const from = context?.from?.trim().toUpperCase() ?? match?.[1]?.toUpperCase();
  const to = context?.to?.trim().toUpperCase() ?? match?.[2]?.toUpperCase();
  const departure = context?.departure?.trim() ?? match?.[3];

  if (!from || !to || !departure) {
    return null;
  }

  const cabinOptions: CabinClass[] = context?.cabinClass
    ? [context.cabinClass, 'ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST']
    : ['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST'];
  const adultOptions = context?.adults
    ? [context.adults, 1, 2, 3, 4]
    : [1, 2, 3, 4];

  const seen = new Set<string>();
  for (const cabinClass of cabinOptions) {
    for (const adults of adultOptions) {
      const key = `${cabinClass}-${adults}`;
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);

      const offers = generateMockFlightOffers({
        from,
        to,
        departure,
        returnDate: context?.returnDate,
        adults,
        children: context?.children ?? 0,
        infants: context?.infants ?? 0,
        cabinClass,
        tripType: context?.tripType,
      });
      const found = offers.find((offer) => offer.id === id);
      if (found) {
        return found;
      }
    }
  }

  return null;
}
