import { changePasswordSchema, updateProfileSchema } from '@/features/profile';

function validProfilePayload(overrides: Record<string, unknown> = {}) {
  return {
    title: 'MR',
    firstName: 'Alex',
    lastName: 'Traveler',
    phone: '+1 555 0100',
    dateOfBirth: '1990-04-12',
    nationality: 'US',
    preferredCabin: 'ECONOMY',
    seatPreference: 'WINDOW',
    mealPreference: 'STANDARD',
    newsletterOptIn: true,
    ...overrides,
  };
}

describe('profile schemas', () => {
  it('accepts a valid profile update payload', () => {
    expect(updateProfileSchema.safeParse(validProfilePayload()).success).toBe(true);
  });

  it('rejects invalid phone numbers', () => {
    expect(updateProfileSchema.safeParse(validProfilePayload({ phone: '12' })).success).toBe(
      false,
    );
  });

  it('rejects underage date of birth', () => {
    expect(
      updateProfileSchema.safeParse(validProfilePayload({ dateOfBirth: '2018-01-01' })).success,
    ).toBe(false);
  });

  it('requires matching passwords on change password', () => {
    expect(
      changePasswordSchema.safeParse({
        currentPassword: 'Password123!',
        newPassword: 'Password456!',
        confirmPassword: 'Password789!',
      }).success,
    ).toBe(false);
  });

  it('rejects reusing the current password', () => {
    expect(
      changePasswordSchema.safeParse({
        currentPassword: 'Password123!',
        newPassword: 'Password123!',
        confirmPassword: 'Password123!',
      }).success,
    ).toBe(false);
  });
});
