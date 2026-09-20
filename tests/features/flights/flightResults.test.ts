import {
  DEFAULT_FLIGHT_FILTERS,
  filterFlightOffers,
  formatDuration,
  formatStopsLabel,
  sortFlightOffers,
  type FlightOffer,
} from '@/features/flights';

const sampleFlights: FlightOffer[] = [
  {
    id: '1',
    airline: { code: 'MH', name: 'Malaysia Airlines' },
    flightNumber: 'MH1',
    origin: { code: 'KUL', city: 'Kuala Lumpur', airportName: 'KLIA' },
    destination: { code: 'NRT', city: 'Tokyo', airportName: 'Narita' },
    departureTime: '2026-10-20T08:00',
    arrivalTime: '2026-10-20T16:00',
    durationMinutes: 480,
    stops: 0,
    stopAirports: [],
    cabinClass: 'ECONOMY',
    baggage: { cabinKg: 7, checkedKg: 20, pieces: 1 },
    price: { amount: 900, currency: 'MYR' },
    availableSeats: 8,
    refundable: true,
    baggageIncluded: true,
  },
  {
    id: '2',
    airline: { code: 'SQ', name: 'Singapore Airlines' },
    flightNumber: 'SQ2',
    origin: { code: 'KUL', city: 'Kuala Lumpur', airportName: 'KLIA' },
    destination: { code: 'NRT', city: 'Tokyo', airportName: 'Narita' },
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
  },
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
