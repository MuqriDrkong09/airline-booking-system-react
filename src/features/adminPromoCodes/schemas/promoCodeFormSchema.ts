import { z } from 'zod';
import { PROMO_DISCOUNT_TYPES } from '@/features/promo';
import { isValidCalendarDate } from '@/features/flights/utils/dates';

function emptyToNull(value: unknown): unknown {
  if (value === '' || value === undefined) {
    return null;
  }
  return value;
}

export const promoCodeFormSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(3, 'Enter a promo code (at least 3 characters)')
      .max(32, 'Code is too long')
      .regex(/^[A-Za-z0-9_-]+$/, 'Use letters, numbers, underscores, or hyphens')
      .transform((value) => value.toUpperCase()),
    description: z
      .string()
      .trim()
      .min(2, 'Enter a description')
      .max(160, 'Description is too long'),
    discountType: z.enum(PROMO_DISCOUNT_TYPES),
    discountValue: z.coerce.number().positive('Discount value must be greater than 0'),
    minimumBookingAmount: z.coerce
      .number()
      .min(0, 'Minimum booking amount cannot be negative'),
    maximumDiscount: z.preprocess(
      emptyToNull,
      z.union([
        z.null(),
        z.coerce.number().min(0, 'Maximum discount cannot be negative'),
      ]),
    ),
    startDate: z
      .string()
      .trim()
      .min(1, 'Enter a start date')
      .refine(isValidCalendarDate, 'Enter a valid start date'),
    endDate: z
      .string()
      .trim()
      .min(1, 'Enter an end date')
      .refine(isValidCalendarDate, 'Enter a valid end date'),
    usageLimit: z.preprocess(
      emptyToNull,
      z.union([
        z.null(),
        z.coerce
          .number()
          .int('Usage limit must be a whole number')
          .min(1, 'Usage limit must be at least 1'),
      ]),
    ),
    active: z.boolean(),
  })
  .superRefine((values, ctx) => {
    if (values.discountType === 'PERCENT' && values.discountValue > 100) {
      ctx.addIssue({
        code: 'custom',
        path: ['discountValue'],
        message: 'Percentage discount cannot exceed 100',
      });
    }

    if (values.endDate < values.startDate) {
      ctx.addIssue({
        code: 'custom',
        path: ['endDate'],
        message: 'End date must be on or after the start date',
      });
    }

    if (
      values.discountType === 'FIXED' &&
      values.maximumDiscount !== null &&
      values.maximumDiscount < values.discountValue
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['maximumDiscount'],
        message: 'Maximum discount cannot be less than the fixed discount value',
      });
    }
  });

export type PromoCodeFormValues = z.input<typeof promoCodeFormSchema>;
export type PromoCodeFormParsedValues = z.output<typeof promoCodeFormSchema>;

export const DEFAULT_PROMO_CODE_FORM_VALUES: PromoCodeFormValues = {
  code: '',
  description: '',
  discountType: 'PERCENT',
  discountValue: 10,
  minimumBookingAmount: 0,
  maximumDiscount: '',
  startDate: '',
  endDate: '',
  usageLimit: '',
  active: true,
};
