import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from '@/features/auth';

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

  it('requires matching passwords on register', () => {
    const result = registerSchema.safeParse({
      firstName: 'Alex',
      lastName: 'Traveler',
      email: 'alex@example.com',
      password: 'Password123',
      confirmPassword: 'Password124',
    });
    expect(result.success).toBe(false);
  });

  it('accepts a strong registration payload', () => {
    const result = registerSchema.safeParse({
      firstName: 'Alex',
      lastName: 'Traveler',
      email: 'alex@example.com',
      password: 'Password123',
      confirmPassword: 'Password123',
    });
    expect(result.success).toBe(true);
  });

  it('validates forgot, reset, and verify payloads', () => {
    expect(forgotPasswordSchema.safeParse({ email: 'a@b.com' }).success).toBe(true);
    expect(
      resetPasswordSchema.safeParse({
        token: 'reset-token',
        password: 'Password123',
        confirmPassword: 'Password123',
      }).success,
    ).toBe(true);
    expect(verifyEmailSchema.safeParse({ token: 'verify-token' }).success).toBe(true);
  });
});
