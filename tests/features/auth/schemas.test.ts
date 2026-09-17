import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from '@/features/auth';

function validRegisterPayload(overrides: Record<string, unknown> = {}) {
  return {
    title: 'MR',
    firstName: 'Alex',
    lastName: 'Traveler',
    email: 'alex@example.com',
    phone: '+60 12 345 6789',
    password: 'Password123!',
    confirmPassword: 'Password123!',
    dateOfBirth: '1995-06-15',
    nationality: 'MY',
    termsAccepted: true,
    ...overrides,
  };
}

describe('auth schemas', () => {
  it('accepts a valid login payload', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: 'secret',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid login email', () => {
    const result = loginSchema.safeParse({
      email: 'not-an-email',
      password: 'secret',
    });
    expect(result.success).toBe(false);
  });

  it('accepts a complete registration payload', () => {
    const result = registerSchema.safeParse(validRegisterPayload());
    expect(result.success).toBe(true);
  });

  it('requires matching passwords on register', () => {
    const result = registerSchema.safeParse(
      validRegisterPayload({ confirmPassword: 'Password124!' }),
    );
    expect(result.success).toBe(false);
  });

  it('rejects weak passwords', () => {
    const result = registerSchema.safeParse(
      validRegisterPayload({ password: 'password', confirmPassword: 'password' }),
    );
    expect(result.success).toBe(false);
  });

  it('rejects invalid phone numbers', () => {
    const result = registerSchema.safeParse(validRegisterPayload({ phone: '123' }));
    expect(result.success).toBe(false);
  });

  it('rejects underage registrants', () => {
    const result = registerSchema.safeParse(validRegisterPayload({ dateOfBirth: '2015-01-01' }));
    expect(result.success).toBe(false);
  });

  it('rejects invalid calendar dates', () => {
    const result = registerSchema.safeParse(validRegisterPayload({ dateOfBirth: '2020-02-30' }));
    expect(result.success).toBe(false);
  });

  it('requires accepted terms', () => {
    const result = registerSchema.safeParse(validRegisterPayload({ termsAccepted: false }));
    expect(result.success).toBe(false);
  });

  it('validates forgot, reset, and verify payloads', () => {
    expect(forgotPasswordSchema.safeParse({ email: 'a@b.com' }).success).toBe(true);
    expect(
      resetPasswordSchema.safeParse({
        token: 'reset-token',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      }).success,
    ).toBe(true);
    expect(verifyEmailSchema.safeParse({ token: 'verify-token' }).success).toBe(true);
  });
});
