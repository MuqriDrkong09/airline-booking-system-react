import { createMockAuthApiWithSessionLookup } from '@/services/auth/mockAuthApi';
import { createMemoryTokenStorage } from '@/services/auth';

describe('mockAuthApi', () => {
  it('logs in demo users and restores sessions from access tokens', async () => {
    const storage = createMemoryTokenStorage();
    const api = createMockAuthApiWithSessionLookup(() => storage.getAccessToken());

    const session = await api.login({
      email: 'user@example.com',
      password: 'Password123!',
    });

    storage.setAccessToken(session.tokens.accessToken);
    storage.setRefreshToken(session.tokens.refreshToken);

    const currentUser = await api.getCurrentUser();
    expect(currentUser.email).toBe('user@example.com');
    expect(currentUser.role).toBe('USER');
  });

  it('rejects invalid credentials', async () => {
    const storage = createMemoryTokenStorage();
    const api = createMockAuthApiWithSessionLookup(() => storage.getAccessToken());

    await expect(
      api.login({ email: 'user@example.com', password: 'nope' }),
    ).rejects.toMatchObject({ message: 'Invalid email or password.' });
  });

  it('supports register, verify, forgot, and reset flows', async () => {
    const storage = createMemoryTokenStorage();
    const api = createMockAuthApiWithSessionLookup(() => storage.getAccessToken());
    const email = `traveler-${Date.now()}@example.com`;

    const registerResponse = await api.register({
      title: 'MS',
      firstName: 'Sam',
      lastName: 'Flyer',
      email,
      phone: '+44 7700 900123',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      dateOfBirth: '1992-03-20',
      nationality: 'GB',
      termsAccepted: true,
    });

    const verifyTokenMatch = /"([^"]+)"/.exec(registerResponse.message);
    expect(verifyTokenMatch?.[1]).toBeTruthy();

    await api.verifyEmail({ token: verifyTokenMatch![1]! });

    const forgotResponse = await api.forgotPassword({ email });
    const resetTokenMatch = /"([^"]+)"/.exec(forgotResponse.message);
    expect(resetTokenMatch?.[1]).toBeTruthy();

    await api.resetPassword({
      token: resetTokenMatch![1]!,
      password: 'Password456!',
      confirmPassword: 'Password456!',
    });

    const session = await api.login({ email, password: 'Password456!' });
    expect(session.user.email).toBe(email);
  });
});
