import { z } from 'zod';

function digitsOnly(value: string): string {
  return value.replace(/\D/g, '');
}

function isValidLuhn(cardNumber: string): boolean {
  let sum = 0;
  let shouldDouble = false;
  for (let index = cardNumber.length - 1; index >= 0; index -= 1) {
    let digit = Number(cardNumber[index]);
    if (Number.isNaN(digit)) {
      return false;
    }
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

function isExpiryInFuture(value: string, asOf = new Date()): boolean {
  const match = /^(\d{2})\s*\/\s*(\d{2})$/.exec(value.trim());
  if (!match) {
    return false;
  }
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  if (month < 1 || month > 12) {
    return false;
  }
  const expiryEnd = new Date(year, month, 0, 23, 59, 59, 999);
  return expiryEnd >= asOf;
}

export const cardFormSchema = z.object({
  cardNumber: z
    .string()
    .trim()
    .min(1, 'Card number is required')
    .refine((value) => {
      const digits = digitsOnly(value);
      return digits.length >= 13 && digits.length <= 19;
    }, { message: 'Enter a valid card number (13–19 digits)' })
    .refine((value) => isValidLuhn(digitsOnly(value)), {
      message: 'Card number failed validation',
    }),
  cardHolder: z
    .string()
    .trim()
    .min(2, 'Cardholder name is required')
    .max(80, 'Cardholder name is too long')
    .regex(/^[a-zA-Z\s.'-]+$/, 'Use letters only for the cardholder name'),
  expiryDate: z
    .string()
    .trim()
    .min(1, 'Expiry date is required')
    .regex(/^\d{2}\s*\/\s*\d{2}$/, 'Use MM/YY format')
    .refine((value) => isExpiryInFuture(value), {
      message: 'Card has expired',
    }),
  cvv: z
    .string()
    .trim()
    .min(1, 'CVV is required')
    .regex(/^\d{3,4}$/, 'CVV must be 3 or 4 digits'),
});

export type CardFormSchemaInput = z.input<typeof cardFormSchema>;
export type CardFormSchemaOutput = z.output<typeof cardFormSchema>;

export const emptyCardFormValues: CardFormSchemaInput = {
  cardNumber: '',
  cardHolder: '',
  expiryDate: '',
  cvv: '',
};

export function formatCardNumberInput(value: string): string {
  const digits = digitsOnly(value).slice(0, 19);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
}

export function formatExpiryInput(value: string): string {
  const digits = digitsOnly(value).slice(0, 4);
  if (digits.length <= 2) {
    return digits;
  }
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function detectCardBrand(cardNumber: string): string {
  const digits = digitsOnly(cardNumber);
  if (/^4/.test(digits)) {
    return 'visa';
  }
  if (/^5[1-5]/.test(digits) || /^2[2-7]/.test(digits)) {
    return 'mastercard';
  }
  if (/^3[47]/.test(digits)) {
    return 'amex';
  }
  return 'card';
}
