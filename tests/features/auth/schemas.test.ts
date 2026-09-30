import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from '@/features/auth';

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

/** DOB that is `age` years old today in UTC. */
function dobYearsAgo(age: number): string {
  const today = new Date();
  const year = today.getUTCFullYear() - age;
  const month = today.getUTCMonth() + 1;
  const day = Math.min(today.getUTCDate(), 28);
  return `${year}-${pad(month)}-${pad(day)}`;
}

/**
 * DOB that becomes `age` only after a later day this month (UTC),
 * so getAgeInYears decrements via same-month dayDiff < 0.
 */
function dobTurningAgeLaterThisMonth(age: number): string | null {
  const today = new Date();
  const day = today.getUTCDate();
  if (day >= 28) {
    return null;
  }
  const year = today.getUTCFullYear() - age;
  const month = today.getUTCMonth() + 1;
  return `${year}-${pad(month)}-${pad(day + 1)}`;
}

/**
 * DOB that becomes `age` next month (UTC),
 * so getAgeInYears decrements via monthDiff < 0.
 */
function dobTurningAgeNextMonth(age: number): string {
  const today = new Date();
  const birth = new Date(
    Date.UTC(today.getUTCFullYear() - age, today.getUTCMonth() + 1, 1),
  );
  return `${birth.getUTCFullYear()}-${pad(birth.getUTCMonth() + 1)}-${pad(birth.getUTCDate())}`;
}

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
      rememberMe: true,
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid login email and empty password', () => {
    expect(
      loginSchema.safeParse({
        email: 'not-an-email',
        password: 'secret',
        rememberMe: false,
      }).success,
    ).toBe(false);

    expect(
      loginSchema.safeParse({
        email: 'user@example.com',
        password: '',
        rememberMe: false,
      }).success,
    ).toBe(false);
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

  it('rejects weak passwords for each complexity rule', () => {
    expect(
      registerSchema.safeParse(
        validRegisterPayload({ password: 'short1!', confirmPassword: 'short1!' }),
      ).success,
    ).toBe(false);
    expect(
      registerSchema.safeParse(
        validRegisterPayload({ password: 'password123!', confirmPassword: 'password123!' }),
      ).success,
    ).toBe(false);
    expect(
      registerSchema.safeParse(
        validRegisterPayload({ password: 'PASSWORD123!', confirmPassword: 'PASSWORD123!' }),
      ).success,
    ).toBe(false);
    expect(
      registerSchema.safeParse(
        validRegisterPayload({ password: 'Password!!!', confirmPassword: 'Password!!!' }),
      ).success,
    ).toBe(false);
    expect(
      registerSchema.safeParse(
        validRegisterPayload({ password: 'Password123', confirmPassword: 'Password123' }),
      ).success,
    ).toBe(false);
  });

  it('rejects invalid titles, names, nationality, and phone numbers', () => {
    expect(registerSchema.safeParse(validRegisterPayload({ title: 'CAPTAIN' })).success).toBe(
      false,
    );
    expect(registerSchema.safeParse(validRegisterPayload({ firstName: '   ' })).success).toBe(
      false,
    );
    expect(registerSchema.safeParse(validRegisterPayload({ lastName: '' })).success).toBe(false);
    expect(registerSchema.safeParse(validRegisterPayload({ nationality: '  ' })).success).toBe(
      false,
    );
    expect(registerSchema.safeParse(validRegisterPayload({ phone: '123' })).success).toBe(false);
    expect(
      registerSchema.safeParse(validRegisterPayload({ phone: '++++++++' })).success,
    ).toBe(false);
  });

  it('rejects underage registrants and age boundary before birthday', () => {
    expect(
      registerSchema.safeParse(validRegisterPayload({ dateOfBirth: '2015-01-01' })).success,
    ).toBe(false);

    expect(
      registerSchema.safeParse(
        validRegisterPayload({ dateOfBirth: dobTurningAgeNextMonth(18) }),
      ).success,
    ).toBe(false);

    const laterThisMonth = dobTurningAgeLaterThisMonth(18);
    if (laterThisMonth) {
      expect(
        registerSchema.safeParse(validRegisterPayload({ dateOfBirth: laterThisMonth })).success,
      ).toBe(false);
    }

    expect(
      registerSchema.safeParse(validRegisterPayload({ dateOfBirth: dobYearsAgo(18) })).success,
    ).toBe(true);
  });

  it('rejects invalid calendar dates and non-ISO formats', () => {
    expect(
      registerSchema.safeParse(validRegisterPayload({ dateOfBirth: '2020-02-30' })).success,
    ).toBe(false);
    expect(
      registerSchema.safeParse(validRegisterPayload({ dateOfBirth: '15-06-1995' })).success,
    ).toBe(false);
    expect(
      registerSchema.safeParse(validRegisterPayload({ dateOfBirth: 'not-a-date' })).success,
    ).toBe(false);
    expect(registerSchema.safeParse(validRegisterPayload({ dateOfBirth: '' })).success).toBe(
      false,
    );
  });

  it('requires accepted terms', () => {
    const result = registerSchema.safeParse(validRegisterPayload({ termsAccepted: false }));
    expect(result.success).toBe(false);
  });

  it('validates forgot, reset, and verify payloads', () => {
    expect(forgotPasswordSchema.safeParse({ email: 'a@b.com' }).success).toBe(true);
    expect(forgotPasswordSchema.safeParse({ email: 'bad' }).success).toBe(false);

    expect(
      resetPasswordSchema.safeParse({
        token: 'reset-token',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      }).success,
    ).toBe(true);
    expect(
      resetPasswordSchema.safeParse({
        token: '',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      }).success,
    ).toBe(false);
    expect(
      resetPasswordSchema.safeParse({
        token: 'reset-token',
        password: 'Password123!',
        confirmPassword: 'Password124!',
      }).success,
    ).toBe(false);

    expect(verifyEmailSchema.safeParse({ token: 'verify-token' }).success).toBe(true);
    expect(verifyEmailSchema.safeParse({ token: '' }).success).toBe(false);
  });
});
