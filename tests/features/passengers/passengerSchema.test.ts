import {
  createPassengersFormSchema,
  createPassengerSlots,
  getAgeOnDeparture,
  isInternationalFlight,
  PASSPORT_VALIDITY_MONTHS_INTERNATIONAL,
  type PassengerDraft,
} from '@/features/passengers';
import { addMonthsToIsoDate } from '@/features/passengers/utils/age';

const departure = '2026-10-20';

function adult(overrides: Partial<PassengerDraft> = {}): PassengerDraft {
  return {
    id: 'adult-1',
    type: 'ADULT',
    title: 'MR',
    firstName: 'Alex',
    lastName: 'Traveler',
    dateOfBirth: '1990-01-15',
    gender: 'MALE',
    nationality: 'MY',
    passportNumber: 'A1234567',
    passportExpiry: addMonthsToIsoDate(departure, PASSPORT_VALIDITY_MONTHS_INTERNATIONAL + 1)!,
    email: 'alex@example.com',
    phone: '+60 12 345 6789',
    associatedAdultId: '',
    ...overrides,
  };
}

function child(overrides: Partial<PassengerDraft> = {}): PassengerDraft {
  return {
    id: 'child-1',
    type: 'CHILD',
    title: 'MISS',
    firstName: 'Sam',
    lastName: 'Traveler',
    dateOfBirth: '2018-05-01',
    gender: 'FEMALE',
    nationality: 'MY',
    passportNumber: 'B7654321',
    passportExpiry: addMonthsToIsoDate(departure, PASSPORT_VALIDITY_MONTHS_INTERNATIONAL + 1)!,
    email: '',
    phone: '',
    associatedAdultId: '',
    ...overrides,
  };
}

function infant(overrides: Partial<PassengerDraft> = {}): PassengerDraft {
  return {
    id: 'infant-1',
    type: 'INFANT',
    title: 'MISS',
    firstName: 'Jamie',
    lastName: 'Traveler',
    dateOfBirth: '2025-08-01',
    gender: 'FEMALE',
    nationality: 'MY',
    passportNumber: 'C1111222',
    passportExpiry: addMonthsToIsoDate(departure, PASSPORT_VALIDITY_MONTHS_INTERNATIONAL + 1)!,
    email: '',
    phone: '',
    associatedAdultId: 'adult-1',
    ...overrides,
  };
}

describe('passenger age helpers', () => {
  it('computes age on the departure date', () => {
    expect(getAgeOnDeparture('2014-10-20', '2026-10-20')).toBe(12);
    expect(getAgeOnDeparture('2014-10-21', '2026-10-20')).toBe(11);
    expect(getAgeOnDeparture('2025-01-01', '2026-10-20')).toBe(1);
  });
});

describe('isInternationalFlight', () => {
  it('detects cross-country routes', () => {
    expect(isInternationalFlight('KUL', 'SIN')).toBe(true);
    expect(isInternationalFlight('KUL', 'PEN')).toBe(false);
  });
});

describe('createPassengerSlots', () => {
  it('builds adult, child, and infant slots from search counts', () => {
    const slots = createPassengerSlots({ adults: 2, children: 1, infants: 1 });
    expect(slots.map((slot) => slot.type)).toEqual(['ADULT', 'ADULT', 'CHILD', 'INFANT']);
    expect(slots.map((slot) => slot.id)).toEqual(['adult-1', 'adult-2', 'child-1', 'infant-1']);
  });
});

describe('createPassengersFormSchema', () => {
  const internationalSchema = createPassengersFormSchema({
    requiresPassport: true,
    departureDate: departure,
    expectedCounts: { adults: 1, children: 0, infants: 0 },
  });

  it('accepts a valid adult on an international flight', () => {
    const result = internationalSchema.safeParse({ passengers: [adult()] });
    expect(result.success).toBe(true);
  });

  it('requires passport details for international flights', () => {
    const result = internationalSchema.safeParse({
      passengers: [adult({ passportNumber: '', passportExpiry: '' })],
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((issue) => issue.path.join('.'));
      expect(paths).toEqual(expect.arrayContaining(['passengers.0.passportNumber']));
      expect(paths).toEqual(expect.arrayContaining(['passengers.0.passportExpiry']));
    }
  });

  it('rejects passport expiry that is too soon after departure', () => {
    const result = internationalSchema.safeParse({
      passengers: [adult({ passportExpiry: '2026-11-01' })],
    });
    expect(result.success).toBe(false);
  });

  it('validates adult / child / infant age bands', () => {
    const mixedSchema = createPassengersFormSchema({
      requiresPassport: true,
      departureDate: departure,
      expectedCounts: { adults: 1, children: 1, infants: 1 },
    });

    expect(
      mixedSchema.safeParse({
        passengers: [adult(), child(), infant()],
      }).success,
    ).toBe(true);

    expect(
      mixedSchema.safeParse({
        passengers: [adult({ dateOfBirth: '2018-01-01' }), child(), infant()],
      }).success,
    ).toBe(false);

    expect(
      mixedSchema.safeParse({
        passengers: [adult(), child({ dateOfBirth: '1990-01-01' }), infant()],
      }).success,
    ).toBe(false);
  });

  it('requires infants to be associated with an adult on the booking', () => {
    const schema = createPassengersFormSchema({
      requiresPassport: true,
      departureDate: departure,
      expectedCounts: { adults: 1, children: 0, infants: 1 },
    });

    const missing = schema.safeParse({
      passengers: [adult(), infant({ associatedAdultId: '' })],
    });
    expect(missing.success).toBe(false);

    const invalidAdult = schema.safeParse({
      passengers: [adult(), infant({ associatedAdultId: 'missing-adult' })],
    });
    expect(invalidAdult.success).toBe(false);
  });

  it('requires passenger counts to match the search criteria', () => {
    const schema = createPassengersFormSchema({
      requiresPassport: false,
      departureDate: departure,
      expectedCounts: { adults: 2, children: 0, infants: 0 },
    });

    const result = schema.safeParse({
      passengers: [adult()],
    });
    expect(result.success).toBe(false);
  });

  it('allows optional passport on domestic flights', () => {
    const domesticSchema = createPassengersFormSchema({
      requiresPassport: false,
      departureDate: departure,
      expectedCounts: { adults: 1, children: 0, infants: 0 },
    });

    expect(
      domesticSchema.safeParse({
        passengers: [adult({ passportNumber: '', passportExpiry: '' })],
      }).success,
    ).toBe(true);
  });
});
