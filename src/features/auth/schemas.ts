import { z } from 'zod';
import { MIN_REGISTRATION_AGE, USER_TITLES } from '@/constants/registration';

const titleValues = USER_TITLES.map((title) => title.value) as [
  (typeof USER_TITLES)[number]['value'],
  ...(typeof USER_TITLES)[number]['value'][],
];

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must include an uppercase letter')
  .regex(/[a-z]/, 'Password must include a lowercase letter')
  .regex(/[0-9]/, 'Password must include a number')
  .regex(/[^A-Za-z0-9]/, 'Password must include a special character');

function isValidCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [yearText, monthText, dayText] = value.split('-');
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function getAgeInYears(dateOfBirth: string, today = new Date()): number {
  const [yearText, monthText, dayText] = dateOfBirth.split('-');
  const birth = new Date(Date.UTC(Number(yearText), Number(monthText) - 1, Number(dayText)));
  let age = today.getUTCFullYear() - birth.getUTCFullYear();
  const monthDiff = today.getUTCMonth() - birth.getUTCMonth();
  const dayDiff = today.getUTCDate() - birth.getUTCDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age -= 1;
  }

  return age;
}

function countPhoneDigits(phone: string): number {
  return phone.replace(/\D/g, '').length;
}

export const loginSchema = z.object({
  email: z.email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean(),
});

export const registerSchema = z
  .object({
    title: z
      .string()
      .min(1, 'Title is required')
      .refine((value) => (titleValues as readonly string[]).includes(value), {
        message: 'Select a valid title',
      }),
    firstName: z.string().trim().min(1, 'First name is required'),
    lastName: z.string().trim().min(1, 'Last name is required'),
    email: z.email('Enter a valid email address'),
    phone: z
      .string()
      .trim()
      .min(1, 'Phone number is required')
      .regex(/^\+?[0-9\s().-]{8,20}$/, 'Enter a valid phone number')
      .refine((value) => countPhoneDigits(value) >= 8, {
        message: 'Phone number must include at least 8 digits',
      }),
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirm your password'),
    dateOfBirth: z
      .string()
      .min(1, 'Date of birth is required')
      .refine(isValidCalendarDate, { message: 'Enter a valid date' })
      .refine((value) => getAgeInYears(value) >= MIN_REGISTRATION_AGE, {
        message: `You must be at least ${MIN_REGISTRATION_AGE} years old`,
      }),
    nationality: z.string().trim().min(1, 'Nationality is required'),
    termsAccepted: z.boolean().refine((value) => value === true, {
      message: 'You must accept the terms and conditions',
    }),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const forgotPasswordSchema = z.object({
  email: z.email('Enter a valid email address'),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Reset token is required'),
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
export type VerifyEmailFormValues = z.infer<typeof verifyEmailSchema>;
