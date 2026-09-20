import { flightSearchSchema, createDefaultFlightSearchValues } from '@/features/flights/schemas/searchSchema';
import { MOCK_AIRPORTS } from '@/features/flights';
import { addDaysIso, todayIsoDate } from '@/features/flights/utils/dates';

const kul = MOCK_AIRPORTS.find((airport) => airport.code === 'KUL')!;
const nrt = MOCK_AIRPORTS.find((airport) => airport.code === 'NRT')!;
const sin = MOCK_AIRPORTS.find((airport) => airport.code === 'SIN')!;

describe('flightSearchSchema', () => {
  it('accepts a valid round-trip search', () => {
    const departure = addDaysIso(todayIsoDate(), 10);
    const values = createDefaultFlightSearchValues({
      tripType: 'ROUND_TRIP',
      origin: kul,
      destination: nrt,
      departureDate: departure,
      returnDate: addDaysIso(departure, 7),
      adults: 2,
      children: 0,
      infants: 1,
      cabinClass: 'ECONOMY',
    });

    expect(flightSearchSchema.safeParse(values).success).toBe(true);
  });

  it('requires distinct origin and destination', () => {
    const values = createDefaultFlightSearchValues({
      tripType: 'ONE_WAY',
      origin: kul,
      destination: kul,
      departureDate: addDaysIso(todayIsoDate(), 3),
    });

    const result = flightSearchSchema.safeParse(values);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path.includes('destination'))).toBe(true);
    }
  });

  it('requires return date for round-trip', () => {
    const values = createDefaultFlightSearchValues({
      tripType: 'ROUND_TRIP',
      origin: kul,
      destination: nrt,
      departureDate: addDaysIso(todayIsoDate(), 3),
      returnDate: '',
    });

    const result = flightSearchSchema.safeParse(values);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path.includes('returnDate'))).toBe(true);
    }
  });

  it('rejects infants exceeding adults', () => {
    const values = createDefaultFlightSearchValues({
      tripType: 'ONE_WAY',
      origin: kul,
      destination: nrt,
      departureDate: addDaysIso(todayIsoDate(), 3),
      adults: 1,
      infants: 2,
    });

    const result = flightSearchSchema.safeParse(values);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path.includes('infants'))).toBe(true);
    }
  });

  it('validates multi-city legs and chronological dates', () => {
    const day1 = addDaysIso(todayIsoDate(), 5);
    const day2 = addDaysIso(todayIsoDate(), 2);

    const values = createDefaultFlightSearchValues({
      tripType: 'MULTI_CITY',
      legs: [
        { origin: kul, destination: nrt, departureDate: day1 },
        { origin: nrt, destination: sin, departureDate: day2 },
      ],
    });

    const result = flightSearchSchema.safeParse(values);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some(
          (issue) => issue.path.join('.') === 'legs.1.departureDate',
        ),
      ).toBe(true);
    }
  });

  it('accepts a valid multi-city search', () => {
    const day1 = addDaysIso(todayIsoDate(), 5);
    const day2 = addDaysIso(todayIsoDate(), 10);

    const values = createDefaultFlightSearchValues({
      tripType: 'MULTI_CITY',
      cabinClass: 'BUSINESS',
      legs: [
        { origin: kul, destination: nrt, departureDate: day1 },
        { origin: nrt, destination: sin, departureDate: day2 },
      ],
    });

    expect(flightSearchSchema.safeParse(values).success).toBe(true);
  });
});
