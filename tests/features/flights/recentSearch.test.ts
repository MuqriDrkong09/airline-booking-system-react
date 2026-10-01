import {
  RECENT_SEARCH_HISTORY_LIMIT,
  criteriaFromRecentSearch,
  prependRecentSearch,
  recentSearchFromFormValues,
  serializeFlightSearchCriteria,
  type Airport,
  type FlightSearchFormValues,
  type RecentFlightSearch,
} from '@/features/flights';

const kul = {
  id: 'kul',
  code: 'KUL',
  name: 'Kuala Lumpur International',
  city: 'Kuala Lumpur',
  country: 'Malaysia',
  timezone: 'Asia/Kuala_Lumpur',
  terminalCount: 2,
  latitude: 2.7456,
  longitude: 101.7072,
  active: true,
} as Airport;

const nrt = {
  id: 'nrt',
  code: 'NRT',
  name: 'Narita International',
  city: 'Tokyo',
  country: 'Japan',
  timezone: 'Asia/Tokyo',
  terminalCount: 3,
  latitude: 35.772,
  longitude: 140.3929,
  active: true,
} as Airport;

function makeFormValues(
  overrides: Partial<FlightSearchFormValues> = {},
): FlightSearchFormValues {
  return {
    tripType: 'ONE_WAY',
    origin: kul,
    destination: nrt,
    departureDate: '2026-10-20',
    returnDate: '',
    adults: 2,
    children: 1,
    infants: 0,
    cabinClass: 'ECONOMY',
    legs: [],
    ...overrides,
  };
}

describe('recentSearch helpers', () => {
  it('builds a recent search entry from form values', () => {
    const entry = recentSearchFromFormValues(
      makeFormValues({
        tripType: 'ROUND_TRIP',
        returnDate: '2026-10-27',
      }),
      '2026-10-01T08:00:00.000Z',
    );

    expect(entry).toMatchObject({
      origin: 'KUL',
      destination: 'NRT',
      departureDate: '2026-10-20',
      returnDate: '2026-10-27',
      passengerCount: 3,
      adults: 2,
      children: 1,
      infants: 0,
      cabinClass: 'ECONOMY',
      timestamp: '2026-10-01T08:00:00.000Z',
    });
  });

  it('returns null when required route fields are missing', () => {
    expect(
      recentSearchFromFormValues(
        makeFormValues({
          origin: null,
        }),
      ),
    ).toBeNull();
  });

  it('keeps only the latest searches up to the history limit and deduplicates', () => {
    const base: RecentFlightSearch = {
      id: 'a',
      origin: 'KUL',
      destination: 'NRT',
      departureDate: '2026-10-20',
      returnDate: null,
      passengerCount: 1,
      adults: 1,
      children: 0,
      infants: 0,
      cabinClass: 'ECONOMY',
      timestamp: '2026-10-01T08:00:00.000Z',
    };

    const seeded = Array.from({ length: RECENT_SEARCH_HISTORY_LIMIT }, (_, index) => ({
      ...base,
      id: `old-${index}`,
      destination: `A${String(index).padStart(2, '0')}`,
      timestamp: `2026-10-01T0${index}:00:00.000Z`,
    }));

    const duplicate: RecentFlightSearch = {
      ...base,
      id: 'dup',
      timestamp: '2026-10-02T08:00:00.000Z',
    };
    const withDuplicate = prependRecentSearch(
      [{ ...base, id: 'existing-same' }, ...seeded.slice(1)],
      duplicate,
      RECENT_SEARCH_HISTORY_LIMIT,
    );

    expect(withDuplicate[0]?.id).toBe('dup');
    expect(withDuplicate.some((item) => item.id === 'existing-same')).toBe(false);
    expect(withDuplicate).toHaveLength(RECENT_SEARCH_HISTORY_LIMIT);

    const overflowEntry: RecentFlightSearch = {
      ...base,
      id: 'new',
      destination: 'SIN',
      timestamp: '2026-10-03T08:00:00.000Z',
    };
    const limited = prependRecentSearch(seeded, overflowEntry, RECENT_SEARCH_HISTORY_LIMIT);
    expect(limited).toHaveLength(RECENT_SEARCH_HISTORY_LIMIT);
    expect(limited[0]?.id).toBe('new');
    expect(limited.some((item) => item.id === 'old-9')).toBe(false);
  });

  it('serializes a recent search into flight search criteria', () => {
    const criteria = criteriaFromRecentSearch({
      id: 's1',
      origin: 'KUL',
      destination: 'NRT',
      departureDate: '2026-10-20',
      returnDate: '2026-10-27',
      passengerCount: 2,
      adults: 2,
      children: 0,
      infants: 0,
      cabinClass: 'BUSINESS',
      timestamp: '2026-10-01T08:00:00.000Z',
    });

    expect(criteria).toEqual({
      tripType: 'ROUND_TRIP',
      from: 'KUL',
      to: 'NRT',
      departure: '2026-10-20',
      returnDate: '2026-10-27',
      adults: 2,
      children: 0,
      infants: 0,
      cabinClass: 'BUSINESS',
    });

    const params = serializeFlightSearchCriteria(criteria);
    expect(params.get('from')).toBe('KUL');
    expect(params.get('return')).toBe('2026-10-27');
    expect(params.get('cabin')).toBe('BUSINESS');
  });
});
