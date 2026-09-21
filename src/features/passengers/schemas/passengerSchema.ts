import { z } from 'zod';
import { NATIONALITIES, USER_TITLES } from '@/constants/registration';
import {
  GENDERS,
  PASSPORT_VALIDITY_MONTHS_INTERNATIONAL,
  PASSENGER_AGE,
  PASSENGER_TYPES,
  type PassengerType,
} from '../constants/passenger';
import type { PassengerCounts } from '../types/passenger';
import {
  addMonthsToIsoDate,
  countPhoneDigits,
  getAgeOnDeparture,
  isDateOnOrAfter,
  isValidCalendarDate,
} from '../utils/age';
import { countPassengersByType, passengerCountsMatch } from '../utils/createPassengerSlots';

const titleValues = USER_TITLES.map((title) => title.value) as [
  (typeof USER_TITLES)[number]['value'],
  ...(typeof USER_TITLES)[number]['value'][],
];

const genderValues = GENDERS.map((gender) => gender.value) as [
  (typeof GENDERS)[number]['value'],
  ...(typeof GENDERS)[number]['value'][],
];

const nationalityValues = NATIONALITIES.map((item) => item.value) as [
  (typeof NATIONALITIES)[number]['value'],
  ...(typeof NATIONALITIES)[number]['value'][],
];

export interface PassengerSchemaOptions {
  requiresPassport: boolean;
  departureDate: string;
  expectedCounts: PassengerCounts;
}

function ageMessageForType(type: PassengerType): string {
  switch (type) {
    case 'ADULT':
      return `Adults must be at least ${PASSENGER_AGE.ADULT_MIN_YEARS} years old on the departure date`;
    case 'CHILD':
      return `Children must be ${PASSENGER_AGE.CHILD_MIN_YEARS}–${PASSENGER_AGE.ADULT_MIN_YEARS - 1} years old on the departure date`;
    case 'INFANT':
      return `Infants must be under ${PASSENGER_AGE.INFANT_MAX_YEARS} years old on the departure date`;
    default: {
      const _exhaustive: never = type;
      return _exhaustive;
    }
  }
}

function matchesAgeBand(type: PassengerType, age: number): boolean {
  if (Number.isNaN(age) || age < 0) {
    return false;
  }
  switch (type) {
    case 'ADULT':
      return age >= PASSENGER_AGE.ADULT_MIN_YEARS;
    case 'CHILD':
      return age >= PASSENGER_AGE.CHILD_MIN_YEARS && age < PASSENGER_AGE.ADULT_MIN_YEARS;
    case 'INFANT':
      return age < PASSENGER_AGE.INFANT_MAX_YEARS;
    default: {
      const _exhaustive: never = type;
      return _exhaustive;
    }
  }
}

const basePassengerObject = z.object({
  id: z.string().min(1),
  type: z.enum(PASSENGER_TYPES),
  // Allow empty strings through so object-level superRefine always runs.
  title: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  dateOfBirth: z.string(),
  gender: z.string(),
  nationality: z.string(),
  passportNumber: z.string(),
  passportExpiry: z.string(),
  email: z.string(),
  phone: z.string(),
  associatedAdultId: z.string(),
});

export function createPassengerSchema(options: {
  requiresPassport: boolean;
  departureDate: string;
}) {
  const { requiresPassport, departureDate } = options;

  return basePassengerObject.superRefine((passenger, ctx) => {
    if (!passenger.title.trim()) {
      ctx.addIssue({ code: 'custom', path: ['title'], message: 'Title is required' });
    } else if (!(titleValues as readonly string[]).includes(passenger.title)) {
      ctx.addIssue({ code: 'custom', path: ['title'], message: 'Select a valid title' });
    }

    if (!passenger.firstName.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['firstName'],
        message: 'First name is required',
      });
    }

    if (!passenger.lastName.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['lastName'],
        message: 'Last name is required',
      });
    }

    if (!passenger.dateOfBirth.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['dateOfBirth'],
        message: 'Date of birth is required',
      });
    } else if (!isValidCalendarDate(passenger.dateOfBirth)) {
      ctx.addIssue({
        code: 'custom',
        path: ['dateOfBirth'],
        message: 'Enter a valid date of birth',
      });
    } else {
      const age = getAgeOnDeparture(passenger.dateOfBirth, departureDate);
      if (!matchesAgeBand(passenger.type, age)) {
        ctx.addIssue({
          code: 'custom',
          path: ['dateOfBirth'],
          message: ageMessageForType(passenger.type),
        });
      }
    }

    if (!passenger.gender.trim()) {
      ctx.addIssue({ code: 'custom', path: ['gender'], message: 'Gender is required' });
    } else if (!(genderValues as readonly string[]).includes(passenger.gender)) {
      ctx.addIssue({ code: 'custom', path: ['gender'], message: 'Select a valid gender' });
    }

    if (!passenger.nationality.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['nationality'],
        message: 'Nationality is required',
      });
    } else if (!(nationalityValues as readonly string[]).includes(passenger.nationality)) {
      ctx.addIssue({
        code: 'custom',
        path: ['nationality'],
        message: 'Select a valid nationality',
      });
    }

    const needsContact = passenger.type === 'ADULT';
    if (needsContact) {
      const emailResult = z.email('Enter a valid email address').safeParse(passenger.email);
      if (!passenger.email.trim()) {
        ctx.addIssue({
          code: 'custom',
          path: ['email'],
          message: 'Email is required for adults',
        });
      } else if (!emailResult.success) {
        ctx.addIssue({
          code: 'custom',
          path: ['email'],
          message: 'Enter a valid email address',
        });
      }

      if (!passenger.phone.trim()) {
        ctx.addIssue({
          code: 'custom',
          path: ['phone'],
          message: 'Phone is required for adults',
        });
      } else if (
        !/^\+?[0-9\s().-]{8,20}$/.test(passenger.phone) ||
        countPhoneDigits(passenger.phone) < 8
      ) {
        ctx.addIssue({
          code: 'custom',
          path: ['phone'],
          message: 'Enter a valid phone number',
        });
      }
    } else if (passenger.email.trim()) {
      const emailResult = z.email('Enter a valid email address').safeParse(passenger.email);
      if (!emailResult.success) {
        ctx.addIssue({
          code: 'custom',
          path: ['email'],
          message: 'Enter a valid email address',
        });
      }
    } else if (passenger.phone.trim()) {
      if (
        !/^\+?[0-9\s().-]{8,20}$/.test(passenger.phone) ||
        countPhoneDigits(passenger.phone) < 8
      ) {
        ctx.addIssue({
          code: 'custom',
          path: ['phone'],
          message: 'Enter a valid phone number',
        });
      }
    }

    if (requiresPassport) {
      if (!passenger.passportNumber.trim()) {
        ctx.addIssue({
          code: 'custom',
          path: ['passportNumber'],
          message: 'Passport number is required for international flights',
        });
      } else if (!/^[A-Za-z0-9]{6,12}$/.test(passenger.passportNumber.trim())) {
        ctx.addIssue({
          code: 'custom',
          path: ['passportNumber'],
          message: 'Enter a valid passport number (6–12 letters or numbers)',
        });
      }

      if (!passenger.passportExpiry.trim()) {
        ctx.addIssue({
          code: 'custom',
          path: ['passportExpiry'],
          message: 'Passport expiry is required for international flights',
        });
      } else if (!isValidCalendarDate(passenger.passportExpiry)) {
        ctx.addIssue({
          code: 'custom',
          path: ['passportExpiry'],
          message: 'Enter a valid passport expiry date',
        });
      } else {
        const minimumExpiry =
          addMonthsToIsoDate(departureDate, PASSPORT_VALIDITY_MONTHS_INTERNATIONAL) ??
          departureDate;
        if (!isDateOnOrAfter(passenger.passportExpiry, minimumExpiry)) {
          ctx.addIssue({
            code: 'custom',
            path: ['passportExpiry'],
            message: `Passport must be valid for at least ${PASSPORT_VALIDITY_MONTHS_INTERNATIONAL} months after departure`,
          });
        }
      }
    } else if (passenger.passportNumber.trim() || passenger.passportExpiry.trim()) {
      if (
        passenger.passportNumber.trim() &&
        !/^[A-Za-z0-9]{6,12}$/.test(passenger.passportNumber.trim())
      ) {
        ctx.addIssue({
          code: 'custom',
          path: ['passportNumber'],
          message: 'Enter a valid passport number (6–12 letters or numbers)',
        });
      }
      if (passenger.passportExpiry.trim()) {
        if (!isValidCalendarDate(passenger.passportExpiry)) {
          ctx.addIssue({
            code: 'custom',
            path: ['passportExpiry'],
            message: 'Enter a valid passport expiry date',
          });
        } else if (!isDateOnOrAfter(passenger.passportExpiry, departureDate)) {
          ctx.addIssue({
            code: 'custom',
            path: ['passportExpiry'],
            message: 'Passport expiry must be on or after the departure date',
          });
        }
      }
    }

    if (passenger.type === 'INFANT' && !passenger.associatedAdultId.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['associatedAdultId'],
        message: 'Select an adult traveling with this infant',
      });
    }
  });
}

export function createPassengersFormSchema(options: PassengerSchemaOptions) {
  const passengerSchema = createPassengerSchema({
    requiresPassport: options.requiresPassport,
    departureDate: options.departureDate,
  });

  return z
    .object({
      passengers: z.array(passengerSchema).min(1, 'Add at least one passenger'),
    })
    .superRefine((values, ctx) => {
      const actual = countPassengersByType(
        values.passengers as Parameters<typeof countPassengersByType>[0],
      );
      if (!passengerCountsMatch(actual, options.expectedCounts)) {
        ctx.addIssue({
          code: 'custom',
          path: ['passengers'],
          message: `Passenger counts must match your search (${options.expectedCounts.adults} adult(s), ${options.expectedCounts.children} child(ren), ${options.expectedCounts.infants} infant(s))`,
        });
      }

      const adultIds = new Set(
        values.passengers.filter((passenger) => passenger.type === 'ADULT').map((p) => p.id),
      );

      values.passengers.forEach((passenger, index) => {
        if (passenger.type !== 'INFANT') {
          return;
        }
        if (
          passenger.associatedAdultId &&
          !adultIds.has(passenger.associatedAdultId)
        ) {
          ctx.addIssue({
            code: 'custom',
            path: ['passengers', index, 'associatedAdultId'],
            message: 'Infant must be associated with an adult on this booking',
          });
        }
      });

      const ids = values.passengers.map((passenger) => passenger.id);
      if (new Set(ids).size !== ids.length) {
        ctx.addIssue({
          code: 'custom',
          path: ['passengers'],
          message: 'Each passenger must have a unique id',
        });
      }
    });
}

export type PassengersFormSchema = ReturnType<typeof createPassengersFormSchema>;
export type PassengersFormParsed = z.infer<PassengersFormSchema>;
