import { z } from 'zod';
import { CABIN_CLASSES } from '@/features/flights';
import { ADMIN_SEAT_TYPE_VALUES } from '../types/adminAircraft';

const columnTokenSchema = z
  .string()
  .trim()
  .regex(/^([A-Za-z]|\|)$/, 'Columns must be letters or aisle markers (|)');

export const aircraftConfiguredSeatSchema = z
  .object({
    id: z.string().trim().min(1, 'Seat id is required'),
    row: z.number().int('Row must be a whole number').min(1, 'Row must be at least 1').max(80),
    column: z
      .string()
      .trim()
      .regex(/^[A-Za-z]$/, 'Column must be a single letter')
      .transform((value) => value.toUpperCase()),
    label: z
      .string()
      .trim()
      .min(1, 'Seat label is required')
      .max(8, 'Seat label is too long')
      .transform((value) => value.toUpperCase()),
    cabinClass: z.enum(CABIN_CLASSES),
    seatType: z.enum(ADMIN_SEAT_TYPE_VALUES),
    price: z
      .number()
      .min(0, 'Price cannot be negative')
      .max(10_000, 'Price looks too high'),
    emergencyExit: z.boolean(),
    disabled: z.boolean(),
  })
  .superRefine((seat, context) => {
    if (seat.seatType === 'EMERGENCY_EXIT' && !seat.emergencyExit) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['emergencyExit'],
        message: 'Emergency-exit seat type requires the emergency exit flag',
      });
    }
    if (seat.seatType === 'UNAVAILABLE' && !seat.disabled) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['disabled'],
        message: 'Unavailable seat type requires the disabled flag',
      });
    }
  });

export const aircraftSeatMapConfigSchema = z
  .object({
    layoutKey: z.string().trim().min(1, 'Layout key is required').max(120),
    rows: z.number().int().min(1, 'Enter at least 1 row').max(80, 'Too many rows'),
    columns: z.array(columnTokenSchema).min(1, 'Enter at least one column'),
    cabins: z.array(
      z.object({
        cabinClass: z.enum(CABIN_CLASSES),
        seatCount: z.number().int().min(0),
        columns: z.array(columnTokenSchema).min(1),
        startRow: z.number().int().min(1),
        rowCount: z.number().int().min(1),
      }),
    ),
    seats: z.array(aircraftConfiguredSeatSchema).min(1, 'Configure at least one seat'),
    notes: z.string().trim().max(500).optional(),
    version: z.number().int().min(1),
  })
  .superRefine((config, context) => {
    const letterColumns = config.columns
      .filter((token) => token !== '|')
      .map((token) => token.toUpperCase());
    const uniqueLetters = new Set(letterColumns);

    if (uniqueLetters.size !== letterColumns.length) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['columns'],
        message: 'Column letters must be unique',
      });
    }

    if (letterColumns.length === 0) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['columns'],
        message: 'Include at least one seat column letter',
      });
    }

    const ids = new Set<string>();
    const labels = new Set<string>();
    const positions = new Set<string>();

    config.seats.forEach((seat, index) => {
      if (ids.has(seat.id)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['seats', index, 'id'],
          message: 'Seat id must be unique',
        });
      }
      ids.add(seat.id);

      if (labels.has(seat.label)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['seats', index, 'label'],
          message: 'Seat label must be unique',
        });
      }
      labels.add(seat.label);

      const positionKey = `${seat.row}:${seat.column}`;
      if (positions.has(positionKey)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['seats', index, 'column'],
          message: 'Seat position must be unique',
        });
      }
      positions.add(positionKey);

      if (seat.row > config.rows) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['seats', index, 'row'],
          message: `Row must be between 1 and ${config.rows}`,
        });
      }

      if (!uniqueLetters.has(seat.column)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['seats', index, 'column'],
          message: 'Seat column must exist in the layout columns',
        });
      }
    });
  });

export type AircraftConfiguredSeatInput = z.input<typeof aircraftConfiguredSeatSchema>;
export type AircraftConfiguredSeatParsed = z.output<typeof aircraftConfiguredSeatSchema>;
export type AircraftSeatMapConfigInput = z.input<typeof aircraftSeatMapConfigSchema>;
export type AircraftSeatMapConfigParsed = z.output<typeof aircraftSeatMapConfigSchema>;
