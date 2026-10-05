import { z } from 'zod';

const nonNegativeSeatCount = z.coerce
  .number()
  .int('Seat count must be a whole number')
  .min(0, 'Seat count cannot be negative')
  .max(600, 'Seat count looks too high');

export const aircraftFormSchema = z
  .object({
    manufacturer: z
      .string()
      .trim()
      .min(2, 'Enter a manufacturer')
      .max(80, 'Manufacturer name is too long'),
    model: z.string().trim().min(1, 'Enter a model').max(80, 'Model is too long'),
    registration: z
      .string()
      .trim()
      .min(3, 'Enter a registration')
      .max(12, 'Registration is too long')
      .regex(/^[A-Za-z0-9-]+$/, 'Use letters, numbers, and hyphens only')
      .transform((value) => value.toUpperCase()),
    totalSeats: z.coerce
      .number()
      .int('Total seats must be a whole number')
      .min(1, 'Enter at least 1 seat')
      .max(600, 'Total seats looks too high'),
    economySeats: nonNegativeSeatCount,
    premiumEconomySeats: nonNegativeSeatCount,
    businessSeats: nonNegativeSeatCount,
    firstClassSeats: nonNegativeSeatCount,
    active: z.boolean(),
  })
  .superRefine((values, context) => {
    const cabinTotal =
      values.economySeats +
      values.premiumEconomySeats +
      values.businessSeats +
      values.firstClassSeats;

    if (cabinTotal !== values.totalSeats) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['totalSeats'],
        message: `Total seats must equal cabin seats (${cabinTotal})`,
      });
    }
  });

export type AircraftFormValues = z.input<typeof aircraftFormSchema>;
export type AircraftFormParsedValues = z.output<typeof aircraftFormSchema>;

export const DEFAULT_AIRCRAFT_FORM_VALUES: AircraftFormValues = {
  manufacturer: '',
  model: '',
  registration: '',
  totalSeats: 1,
  economySeats: 1,
  premiumEconomySeats: 0,
  businessSeats: 0,
  firstClassSeats: 0,
  active: true,
};
