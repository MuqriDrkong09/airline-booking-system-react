import { z } from 'zod';

export const airportFormSchema = z.object({
  code: z
    .string()
    .trim()
    .min(3, 'Enter a 3-letter IATA code')
    .max(3, 'Enter a 3-letter IATA code')
    .regex(/^[A-Za-z]{3}$/, 'Use a 3-letter IATA code')
    .transform((value) => value.toUpperCase()),
  name: z.string().trim().min(2, 'Enter an airport name').max(120, 'Name is too long'),
  city: z.string().trim().min(1, 'Enter a city').max(80, 'City is too long'),
  country: z.string().trim().min(1, 'Enter a country').max(80, 'Country is too long'),
  timezone: z
    .string()
    .trim()
    .min(1, 'Enter a timezone')
    .regex(/^[A-Za-z]+(?:\/[A-Za-z_+-]+)+$/, 'Use an IANA timezone like Asia/Kuala_Lumpur'),
  terminals: z.coerce
    .number()
    .int('Terminals must be a whole number')
    .min(1, 'Enter at least 1 terminal')
    .max(20, 'Terminal count looks too high'),
  latitude: z.coerce
    .number()
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90'),
  longitude: z.coerce
    .number()
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180'),
  active: z.boolean(),
});

export type AirportFormValues = z.input<typeof airportFormSchema>;
export type AirportFormParsedValues = z.output<typeof airportFormSchema>;

export const DEFAULT_AIRPORT_FORM_VALUES: AirportFormValues = {
  code: '',
  name: '',
  city: '',
  country: '',
  timezone: '',
  terminals: 1,
  latitude: 0,
  longitude: 0,
  active: true,
};
