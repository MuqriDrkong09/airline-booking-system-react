import { z } from 'zod';
import {
  CABIN_CLASSES,
  FLIGHT_OPERATIONAL_STATUSES,
} from '@/features/flights';

const datetimeLocalPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

export const flightFormSchema = z
  .object({
    airline: z.string().trim().min(1, 'Select an airline'),
    flightNumber: z
      .string()
      .trim()
      .min(2, 'Enter a flight number')
      .max(10, 'Flight number is too long')
      .regex(/^[A-Z0-9]+$/i, 'Use letters and numbers only')
      .transform((value) => value.toUpperCase()),
    origin: z.string().trim().min(1, 'Select an origin'),
    destination: z.string().trim().min(1, 'Select a destination'),
    aircraft: z.string().trim().min(1, 'Enter an aircraft'),
    departure: z
      .string()
      .trim()
      .regex(datetimeLocalPattern, 'Enter a valid departure date and time'),
    arrival: z
      .string()
      .trim()
      .regex(datetimeLocalPattern, 'Enter a valid arrival date and time'),
    terminal: z.string().trim().min(1, 'Enter a terminal'),
    gate: z.string().trim().min(1, 'Enter a gate'),
    status: z.enum(FLIGHT_OPERATIONAL_STATUSES),
    availableSeats: z.coerce
      .number()
      .int('Seats must be a whole number')
      .min(0, 'Seats cannot be negative')
      .max(850, 'Seats look too high'),
    fareClasses: z
      .array(z.enum(CABIN_CLASSES))
      .min(1, 'Select at least one fare class'),
  })
  .superRefine((values, ctx) => {
    if (values.origin && values.destination && values.origin === values.destination) {
      ctx.addIssue({
        code: 'custom',
        path: ['destination'],
        message: 'Destination must differ from origin',
      });
    }

    if (
      values.departure &&
      values.arrival &&
      new Date(values.arrival).getTime() <= new Date(values.departure).getTime()
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['arrival'],
        message: 'Arrival must be after departure',
      });
    }
  });

export type FlightFormValues = z.input<typeof flightFormSchema>;
export type FlightFormParsedValues = z.output<typeof flightFormSchema>;

export const DEFAULT_FLIGHT_FORM_VALUES: FlightFormValues = {
  airline: '',
  flightNumber: '',
  origin: '',
  destination: '',
  aircraft: '',
  departure: '',
  arrival: '',
  terminal: '',
  gate: '',
  status: 'SCHEDULED',
  availableSeats: 120,
  fareClasses: ['ECONOMY'],
};
