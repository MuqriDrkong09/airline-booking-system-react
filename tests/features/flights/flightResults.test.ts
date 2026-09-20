import {
  DEFAULT_FLIGHT_FILTERS,
  filterFlightOffers,
  formatDuration,
  formatStopsLabel,
  sortFlightOffers,
  type FlightOffer,
} from '@/features/flights';

function createSampleFlight(overrides: Partial<FlightOffer> & Pick<FlightOffer, 'id'>): FlightOffer {
  const origin = overrides.origin ?? {
    code: 'KUL',
    city: 'Kuala Lumpur',
    airportName: 'KLIA',
    terminal: '1',
  };
  const destination = overrides.destination ?? {
    code: 'NRT',
    city: 'Tokyo',
    airportName: 'Narita',
    terminal: '2',
  };
  const airline = overrides.airline ?? { code: 'MH', name: 'Malaysia Airlines' };
  const aircraft = overrides.aircraft ?? { model: 'Boeing 737-800', registration: '9M-100' };
  const departureTime = overrides.departureTime ?? '2026-10-20T08:00';
  const arrivalTime = overrides.arrivalTime ?? '2026-10-20T16:00';
  const durationMinutes = overrides.durationMinutes ?? 480;
  const flightNumber = overrides.flightNumber ?? 'MH1';

  return {
    airline,
    flightNumber,
    aircraft,
    origin,
    destination,
    departureTime,
    arrivalTime,
    durationMinutes,
    stops: 0,
    stopAirports: [],
    cabinClass: 'ECONOMY',
    baggage: {
      cabinKg: 7,
      checkedKg: 20,
      pieces: 1,
      allowanceSummary: '1 checked piece up to 20kg · 7kg cabin bag',
    },
    amenities: {
      meals: 'Hot meal and soft drinks',
      wifi: true,
      wifiNotes: 'Wi-Fi available for purchase',
      seatInformation: 'Standard seat · 30–32" pitch',
    },
    policies: {
      refundPolicy: 'Refundable before departure with a fee.',
      changePolicy: 'Changes allowed with fare difference.',
      fareConditions: ['Name changes are not permitted after ticketing.'],
    },
    segments: [
      {
        id: `${overrides.id}-seg-1`,
        flightNumber,
        airline,
        aircraft,
        origin,
        destination,
        departureTime,
        arrivalTime,
        durationMinutes,
      },
    ],
    price: { amount: 900, currency: 'MYR' },
    availableSeats: 8,
    refundable: true,
    baggageIncluded: true,
    ...overrides,
  };
}

const sampleFlights: FlightOffer[] = [
  createSampleFlight({ id: '1' }),
  createSampleFlight({
    id: '2',
    airline: { code: 'SQ', name: 'Singapore Airlines' },
    flightNumber: 'SQ2',
    departureTime: '2026-10-20T10:00',
    arrivalTime: '2026-10-20T20:00',
    durationMinutes: 600,
    stops: 1,
    stopAirports: ['SIN'],
    cabinClass: 'BUSINESS',
    baggage: { cabinKg: 7, checkedKg: 0, pieces: 0 },
    price: { amount: 700, currency: 'MYR' },
    availableSeats: 3,
    refundable: false,
    baggageIncluded: false,
  }),
];

describe('flightResults helpers', () => {
  it('formats duration and stops labels', () => {
    expect(formatDuration(90)).toBe('1h 30m');
    expect(formatStopsLabel(0)).toBe('Nonstop');
    expect(formatStopsLabel(1, ['SIN'])).toBe('1 stop (SIN)');
  });

  it('filters by stops and airline', () => {
    const filtered = filterFlightOffers(sampleFlights, {
      ...DEFAULT_FLIGHT_FILTERS,
      stops: [0],
      airlines: ['MH'],
    });

    expect(filtered.map((flight) => flight.id)).toEqual(['1']);
  });

  it('filters by time, duration, cabin, refundable, and baggage', () => {
    const filtered = filterFlightOffers(sampleFlights, {
      ...DEFAULT_FLIGHT_FILTERS,
      departureHourStart: 9,
      departureHourEnd: 12,
      durationMax: 650,
      cabinClasses: ['BUSINESS'],
      refundableOnly: false,
      baggageIncludedOnly: false,
    });

    expect(filtered.map((flight) => flight.id)).toEqual(['2']);

    expect(
      filterFlightOffers(sampleFlights, {
        ...DEFAULT_FLIGHT_FILTERS,
        refundableOnly: true,
        baggageIncludedOnly: true,
      }).map((flight) => flight.id),
    ).toEqual(['1']);
  });

  it('sorts without mutating the original array', () => {
    const originalOrder = sampleFlights.map((flight) => flight.id);
    const sorted = sortFlightOffers(sampleFlights, 'lowest_price');

    expect(sorted.map((flight) => flight.id)).toEqual(['2', '1']);
    expect(sampleFlights.map((flight) => flight.id)).toEqual(originalOrder);
    expect(sorted).not.toBe(sampleFlights);
  });

  it('keeps API order for recommended and supports the other sort options', () => {
    expect(sortFlightOffers(sampleFlights, 'recommended').map((flight) => flight.id)).toEqual([
      '1',
      '2',
    ]);
    expect(sortFlightOffers(sampleFlights, 'shortest_duration').map((flight) => flight.id)).toEqual([
      '1',
      '2',
    ]);
    expect(sortFlightOffers(sampleFlights, 'earliest_departure').map((flight) => flight.id)).toEqual([
      '1',
      '2',
    ]);
    expect(sortFlightOffers(sampleFlights, 'latest_departure').map((flight) => flight.id)).toEqual([
      '2',
      '1',
    ]);
    expect(sortFlightOffers(sampleFlights, 'earliest_arrival').map((flight) => flight.id)).toEqual([
      '1',
      '2',
    ]);
  });
});
