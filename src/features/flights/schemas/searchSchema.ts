import { z } from 'zod';
import {
  CABIN_CLASSES,
  type Airport,
  type FlightSearchFormValues,
  TRIP_TYPES,
} from '../types';
import {
  MAX_MULTI_CITY_LEGS,
  MAX_PASSENGERS,
  MIN_ADULTS,
  MIN_MULTI_CITY_LEGS,
} from '../constants/search';
import { compareIsoDates, isValidCalendarDate, todayIsoDate } from '../utils/dates';

const tripTypeSchema = z.enum(TRIP_TYPES);
const cabinClassSchema = z.enum(CABIN_CLASSES);

function isAirport(value: unknown): value is Airport {
  return (
    typeof value === 'object' &&
    value !== null &&
    'code' in value &&
    typeof (value as Airport).code === 'string' &&
    (value as Airport).code.length > 0
  );
}

const airportRequired = z.custom<Airport | null>(isAirport).refine(isAirport, {
  message: 'Select an airport',
});

const dateField = (label: string) =>
  z
    .string()
    .min(1, `${label} is required`)
    .refine(isValidCalendarDate, { message: `Enter a valid ${label.toLowerCase()}` });

const legSchema = z
  .object({
    origin: airportRequired,
    destination: airportRequired,
    departureDate: dateField('Departure date'),
  })
  .superRefine((leg, ctx) => {
    if (leg.origin && leg.destination && leg.origin.code === leg.destination.code) {
      ctx.addIssue({
        code: 'custom',
        message: 'Arrival airport must be different from departure',
        path: ['destination'],
      });
    }

    const today = todayIsoDate();
    if (leg.departureDate && compareIsoDates(leg.departureDate, today) < 0) {
      ctx.addIssue({
        code: 'custom',
        message: 'Departure date cannot be in the past',
        path: ['departureDate'],
      });
    }
  });

export const flightSearchSchema = z
  .object({
    tripType: tripTypeSchema,
    origin: z.custom<Airport | null>((value) => value === null || isAirport(value)),
    destination: z.custom<Airport | null>((value) => value === null || isAirport(value)),
    departureDate: z.string(),
    returnDate: z.string(),
    adults: z.number().int().min(MIN_ADULTS, 'At least one adult is required').max(MAX_PASSENGERS),
    children: z.number().int().min(0).max(MAX_PASSENGERS),
    infants: z.number().int().min(0).max(MAX_PASSENGERS),
    cabinClass: cabinClassSchema,
    legs: z.array(
      z.object({
        origin: z.custom<Airport | null>((value) => value === null || isAirport(value)),
        destination: z.custom<Airport | null>((value) => value === null || isAirport(value)),
        departureDate: z.string(),
      }),
    ),
  })
  .superRefine((values, ctx) => {
    const today = todayIsoDate();
    const totalTravelers = values.adults + values.children;

    if (totalTravelers > MAX_PASSENGERS) {
      ctx.addIssue({
        code: 'custom',
        message: `Adults and children cannot exceed ${MAX_PASSENGERS}`,
        path: ['adults'],
      });
    }

    if (values.infants > values.adults) {
      ctx.addIssue({
        code: 'custom',
        message: 'Infants cannot exceed the number of adults',
        path: ['infants'],
      });
    }

    if (values.tripType === 'MULTI_CITY') {
      if (values.legs.length < MIN_MULTI_CITY_LEGS) {
        ctx.addIssue({
          code: 'custom',
          message: `Add at least ${MIN_MULTI_CITY_LEGS} flights`,
          path: ['legs'],
        });
      }

      if (values.legs.length > MAX_MULTI_CITY_LEGS) {
        ctx.addIssue({
          code: 'custom',
          message: `You can add up to ${MAX_MULTI_CITY_LEGS} flights`,
          path: ['legs'],
        });
      }

      values.legs.forEach((leg, index) => {
        const parsed = legSchema.safeParse(leg);
        if (!parsed.success) {
          parsed.error.issues.forEach((issue) => {
            ctx.addIssue({
              ...issue,
              path: ['legs', index, ...(issue.path ?? [])],
            });
          });
        }

        if (index > 0) {
          const previous = values.legs[index - 1];
          if (
            previous?.departureDate &&
            leg.departureDate &&
            isValidCalendarDate(previous.departureDate) &&
            isValidCalendarDate(leg.departureDate) &&
            compareIsoDates(leg.departureDate, previous.departureDate) < 0
          ) {
            ctx.addIssue({
              code: 'custom',
              message: 'Each flight date must be on or after the previous flight',
              path: ['legs', index, 'departureDate'],
            });
          }
        }
      });

      return;
    }

    if (!isAirport(values.origin)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Select a departure airport',
        path: ['origin'],
      });
    }

    if (!isAirport(values.destination)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Select an arrival airport',
        path: ['destination'],
      });
    }

    if (
      isAirport(values.origin) &&
      isAirport(values.destination) &&
      values.origin.code === values.destination.code
    ) {
      ctx.addIssue({
        code: 'custom',
        message: 'Arrival airport must be different from departure',
        path: ['destination'],
      });
    }

    if (!values.departureDate) {
      ctx.addIssue({
        code: 'custom',
        message: 'Departure date is required',
        path: ['departureDate'],
      });
    } else if (!isValidCalendarDate(values.departureDate)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Enter a valid departure date',
        path: ['departureDate'],
      });
    } else if (compareIsoDates(values.departureDate, today) < 0) {
      ctx.addIssue({
        code: 'custom',
        message: 'Departure date cannot be in the past',
        path: ['departureDate'],
      });
    }

    if (values.tripType === 'ROUND_TRIP') {
      if (!values.returnDate) {
        ctx.addIssue({
          code: 'custom',
          message: 'Return date is required',
          path: ['returnDate'],
        });
      } else if (!isValidCalendarDate(values.returnDate)) {
        ctx.addIssue({
          code: 'custom',
          message: 'Enter a valid return date',
          path: ['returnDate'],
        });
      } else if (
        values.departureDate &&
        isValidCalendarDate(values.departureDate) &&
        compareIsoDates(values.returnDate, values.departureDate) < 0
      ) {
        ctx.addIssue({
          code: 'custom',
          message: 'Return date must be on or after departure',
          path: ['returnDate'],
        });
      }
    }
  });

export type FlightSearchSchemaValues = z.infer<typeof flightSearchSchema>;

export function createEmptyLeg(departureDate = todayIsoDate()): FlightSearchFormValues['legs'][number] {
  return {
    origin: null,
    destination: null,
    departureDate,
  };
}

export function createDefaultFlightSearchValues(
  overrides: Partial<FlightSearchFormValues> = {},
): FlightSearchFormValues {
  const departureDate = overrides.departureDate ?? todayIsoDate();

  return {
    tripType: 'ROUND_TRIP',
    origin: null,
    destination: null,
    departureDate,
    returnDate: overrides.returnDate ?? '',
    adults: 1,
    children: 0,
    infants: 0,
    cabinClass: 'ECONOMY',
    legs: [createEmptyLeg(departureDate), createEmptyLeg(departureDate)],
    ...overrides,
  };
}
