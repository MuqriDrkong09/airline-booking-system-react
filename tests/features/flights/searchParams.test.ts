import {
  parseFlightSearchParams,
  serializeFlightSearchCriteria,
  criteriaFromFormValues,
  formatPassengerSummary,
  formatCabinLabel,
} from '@/features/flights/utils/searchParams';
import { createDefaultFlightSearchValues } from '@/features/flights/schemas/searchSchema';
import { MOCK_AIRPORTS } from '@/features/flights';

describe('flight search URL params', () => {
  it('parses the shared bookmark URL shape', () => {
    const params = new URLSearchParams(
      'from=KUL&to=NRT&departure=2026-10-20&return=2026-10-27&adults=2&cabin=ECONOMY',
    );

    expect(parseFlightSearchParams(params)).toEqual({
      tripType: 'ROUND_TRIP',
      from: 'KUL',
      to: 'NRT',
      departure: '2026-10-20',
      returnDate: '2026-10-27',
      adults: 2,
      children: 0,
      infants: 0,
      cabinClass: 'ECONOMY',
      legs: undefined,
    });
  });

  it('serializes round-trip criteria to query params', () => {
    const params = serializeFlightSearchCriteria({
      tripType: 'ROUND_TRIP',
      from: 'KUL',
      to: 'NRT',
      departure: '2026-10-20',
      returnDate: '2026-10-27',
      adults: 2,
      children: 0,
      infants: 0,
      cabinClass: 'ECONOMY',
    });

    expect(params.get('trip')).toBe('ROUND_TRIP');
    expect(params.get('from')).toBe('KUL');
    expect(params.get('to')).toBe('NRT');
    expect(params.get('departure')).toBe('2026-10-20');
    expect(params.get('return')).toBe('2026-10-27');
    expect(params.get('adults')).toBe('2');
    expect(params.get('cabin')).toBe('ECONOMY');
  });

  it('round-trips multi-city legs through the legs param', () => {
    const params = serializeFlightSearchCriteria({
      tripType: 'MULTI_CITY',
      from: 'KUL',
      to: 'NRT',
      departure: '2026-10-20',
      adults: 1,
      children: 0,
      infants: 0,
      cabinClass: 'BUSINESS',
      legs: [
        { from: 'KUL', to: 'NRT', departure: '2026-10-20' },
        { from: 'NRT', to: 'SIN', departure: '2026-10-25' },
      ],
    });

    expect(params.get('legs')).toBe('KUL:NRT:2026-10-20,NRT:SIN:2026-10-25');
    expect(params.get('from')).toBeNull();

    expect(parseFlightSearchParams(params)).toMatchObject({
      tripType: 'MULTI_CITY',
      cabinClass: 'BUSINESS',
      legs: [
        { from: 'KUL', to: 'NRT', departure: '2026-10-20' },
        { from: 'NRT', to: 'SIN', departure: '2026-10-25' },
      ],
    });
  });

  it('builds criteria from validated form values', () => {
    const kul = MOCK_AIRPORTS.find((airport) => airport.code === 'KUL')!;
    const nrt = MOCK_AIRPORTS.find((airport) => airport.code === 'NRT')!;
    const values = createDefaultFlightSearchValues({
      tripType: 'ONE_WAY',
      origin: kul,
      destination: nrt,
      departureDate: '2026-10-20',
      adults: 2,
      children: 1,
      infants: 0,
      cabinClass: 'PREMIUM_ECONOMY',
    });

    expect(criteriaFromFormValues(values)).toEqual({
      tripType: 'ONE_WAY',
      from: 'KUL',
      to: 'NRT',
      departure: '2026-10-20',
      returnDate: undefined,
      adults: 2,
      children: 1,
      infants: 0,
      cabinClass: 'PREMIUM_ECONOMY',
    });
  });

  it('formats passenger and cabin labels', () => {
    expect(formatPassengerSummary(2, 1, 1)).toBe('2 adults, 1 child, 1 infant');
    expect(formatCabinLabel('PREMIUM_ECONOMY')).toBe('Premium Economy');
  });
});
