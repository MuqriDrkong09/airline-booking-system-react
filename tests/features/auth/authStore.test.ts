import {
  createAuthStore,
  selectIsAuthenticated,
  useAuthStore,
} from '@/features/auth';
import { AuthApiError, createMemoryTokenStorage, type AuthApi } from '@/services/auth';
import type { AuthSession, AuthUser } from '@/types/auth';
import { UserRole } from '@/types/auth';

const mockUser: AuthUser = {
  id: 'user-1',
  email: 'user@example.com',
  firstName: 'Alex',
  lastName: 'Traveler',
  role: UserRole.USER,
  emailVerified: true,
};

const mockSession: AuthSession = {
  user: mockUser,
  tokens: {
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
    expiresIn: 3600,
  },
};

const registerPayload = {
  title: 'MR' as const,
  firstName: 'Alex',
  lastName: 'Traveler',
  email: 'alex@example.com',
  phone: '+1 555 0100',
  password: 'Password123!',
  confirmPassword: 'Password123!',
  dateOfBirth: '1990-01-01',
  nationality: 'US',
  termsAccepted: true,
};

function createMockApi(overrides: Partial<AuthApi> = {}): AuthApi {
  return {
    login: jest.fn().mockResolvedValue(mockSession),
    register: jest.fn().mockResolvedValue({ message: 'Registered' }),
    logout: jest.fn().mockResolvedValue(undefined),
    getCurrentUser: jest.fn().mockResolvedValue(mockUser),
    updateProfile: jest.fn().mockResolvedValue(mockUser),
    changePassword: jest.fn().mockResolvedValue({ message: 'Password updated' }),
    forgotPassword: jest.fn().mockResolvedValue({ message: 'Reset sent' }),
    resetPassword: jest.fn().mockResolvedValue({ message: 'Password reset' }),
    verifyEmail: jest.fn().mockResolvedValue({ message: 'Verified' }),
    ...overrides,
  };
}

describe('createAuthStore', () => {
  it('bootstraps as unauthenticated when no token exists', async () => {
    const storage = createMemoryTokenStorage();
    const api = createMockApi();
    const store = createAuthStore({ api, storage });

    await store.getState().bootstrap();

    expect(store.getState().status).toBe('unauthenticated');
    expect(store.getState().isBootstrapping).toBe(false);
    expect(api.getCurrentUser).not.toHaveBeenCalled();
  });

  it('restores the current user from a stored access token', async () => {
    const storage = createMemoryTokenStorage();
    storage.setAccessToken('access-token');
    const api = createMockApi();
    const store = createAuthStore({ api, storage });

    await store.getState().bootstrap();

    expect(store.getState().status).toBe('authenticated');
    expect(store.getState().user).toEqual(mockUser);
    expect(store.getState().accessToken).toBe('access-token');
  });

  it('clears an invalid session during bootstrap', async () => {
    const storage = createMemoryTokenStorage();
    storage.setAccessToken('stale-token');
    storage.setRefreshToken('stale-refresh');
    const api = createMockApi({
      getCurrentUser: jest
        .fn()
        .mockRejectedValue(new AuthApiError('Unauthorized.', { status: 401 })),
    });
    const store = createAuthStore({ api, storage });

    await store.getState().bootstrap();

    expect(store.getState().status).toBe('unauthenticated');
    expect(storage.getAccessToken()).toBeNull();
    expect(storage.getRefreshToken()).toBeNull();
  });

  it('persists tokens on login and clears them on logout', async () => {
    const storage = createMemoryTokenStorage();
    const setRememberSession = jest.fn();
    storage.setRememberSession = setRememberSession;

    const api = createMockApi();
    const store = createAuthStore({ api, storage });

    const user = await store.getState().login({
      email: 'user@example.com',
      password: 'Password123!',
      rememberMe: true,
    });

    expect(user).toEqual(mockUser);
    expect(setRememberSession).toHaveBeenCalledWith(true);
    expect(storage.getAccessToken()).toBe('access-token');
    expect(storage.getRefreshToken()).toBe('refresh-token');
    expect(store.getState().status).toBe('authenticated');

    await store.getState().logout();

    expect(api.logout).toHaveBeenCalled();
    expect(storage.getAccessToken()).toBeNull();
    expect(store.getState().user).toBeNull();
    expect(store.getState().status).toBe('unauthenticated');
  });

  it('defaults rememberMe to false when omitted from login', async () => {
    const storage = createMemoryTokenStorage();
    const setRememberSession = jest.fn();
    storage.setRememberSession = setRememberSession;
    const api = createMockApi();
    const store = createAuthStore({ api, storage });

    await store.getState().login({
      email: 'user@example.com',
      password: 'Password123!',
    });

    expect(setRememberSession).toHaveBeenCalledWith(false);
    expect(store.getState().status).toBe('authenticated');
  });

  it('logs in without calling setRememberSession when the storage helper is missing', async () => {
    const storage = createMemoryTokenStorage();
    delete storage.setRememberSession;
    const api = createMockApi();
    const store = createAuthStore({ api, storage });

    await store.getState().login({
      email: 'user@example.com',
      password: 'Password123!',
      rememberMe: true,
    });

    expect(store.getState().status).toBe('authenticated');
    expect(storage.getAccessToken()).toBe('access-token');
  });

  it('stores API errors from failed login attempts', async () => {
    const storage = createMemoryTokenStorage();
    const api = createMockApi({
      login: jest
        .fn()
        .mockRejectedValue(new AuthApiError('Invalid email or password.', { status: 401 })),
    });
    const store = createAuthStore({ api, storage });

    await expect(
      store.getState().login({ email: 'bad@example.com', password: 'wrong' }),
    ).rejects.toBeInstanceOf(AuthApiError);

    expect(store.getState().error).toBe('Invalid email or password.');
    expect(store.getState().isSubmitting).toBe(false);
    expect(store.getState().status).not.toBe('authenticated');
  });

  it('clears local session even when logout API fails', async () => {
    const storage = createMemoryTokenStorage();
    storage.setAccessToken('access-token');
    storage.setRefreshToken('refresh-token');
    const api = createMockApi({
      logout: jest.fn().mockRejectedValue(new AuthApiError('Network error.', { status: 500 })),
    });
    const store = createAuthStore({ api, storage });
    store.setState({
      user: mockUser,
      accessToken: 'access-token',
      status: 'authenticated',
    });

    await store.getState().logout();

    expect(storage.getAccessToken()).toBeNull();
    expect(store.getState().user).toBeNull();
    expect(store.getState().status).toBe('unauthenticated');
    expect(store.getState().isSubmitting).toBe(false);
  });

  it('clears stored errors', () => {
    const store = createAuthStore({
      api: createMockApi(),
      storage: createMemoryTokenStorage(),
    });
    store.setState({ error: 'Something went wrong.' });

    store.getState().clearError();

    expect(store.getState().error).toBeNull();
  });

  it('exposes register, forgot, reset, and verify helpers', async () => {
    const storage = createMemoryTokenStorage();
    const api = createMockApi();
    const store = createAuthStore({ api, storage });

    await expect(store.getState().register(registerPayload)).resolves.toBe('Registered');

    await expect(
      store.getState().forgotPassword({ email: 'alex@example.com' }),
    ).resolves.toBe('Reset sent');

    await expect(
      store.getState().resetPassword({
        token: 'reset',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      }),
    ).resolves.toBe('Password reset');

    await expect(store.getState().verifyEmail({ token: 'verify' })).resolves.toBe('Verified');
  });

  it('stores API errors from failed register attempts', async () => {
    const api = createMockApi({
      register: jest
        .fn()
        .mockRejectedValue(new AuthApiError('Email already registered.', { status: 409 })),
    });
    const store = createAuthStore({ api, storage: createMemoryTokenStorage() });

    await expect(store.getState().register(registerPayload)).rejects.toBeInstanceOf(AuthApiError);

    expect(store.getState().error).toBe('Email already registered.');
    expect(store.getState().isSubmitting).toBe(false);
  });

  it('stores API errors from failed forgot-password attempts', async () => {
    const api = createMockApi({
      forgotPassword: jest
        .fn()
        .mockRejectedValue(new AuthApiError('Unable to start password reset.', { status: 500 })),
    });
    const store = createAuthStore({ api, storage: createMemoryTokenStorage() });

    await expect(
      store.getState().forgotPassword({ email: 'alex@example.com' }),
    ).rejects.toBeInstanceOf(AuthApiError);

    expect(store.getState().error).toBe('Unable to start password reset.');
    expect(store.getState().isSubmitting).toBe(false);
  });

  it('stores API errors from failed reset-password attempts', async () => {
    const api = createMockApi({
      resetPassword: jest
        .fn()
        .mockRejectedValue(new AuthApiError('Unable to reset password.', { status: 400 })),
    });
    const store = createAuthStore({ api, storage: createMemoryTokenStorage() });

    await expect(
      store.getState().resetPassword({
        token: 'bad',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      }),
    ).rejects.toBeInstanceOf(AuthApiError);

    expect(store.getState().error).toBe('Unable to reset password.');
    expect(store.getState().isSubmitting).toBe(false);
  });

  it('stores API errors from failed verify-email attempts', async () => {
    const api = createMockApi({
      verifyEmail: jest
        .fn()
        .mockRejectedValue(new AuthApiError('Unable to verify email.', { status: 400 })),
    });
    const store = createAuthStore({ api, storage: createMemoryTokenStorage() });

    await expect(store.getState().verifyEmail({ token: 'bad' })).rejects.toBeInstanceOf(
      AuthApiError,
    );

    expect(store.getState().error).toBe('Unable to verify email.');
    expect(store.getState().isSubmitting).toBe(false);
  });
});

describe('selectIsAuthenticated', () => {
  it('is true only when status is authenticated and a user is present', () => {
    expect(
      selectIsAuthenticated({
        ...useAuthStore.getState(),
        status: 'authenticated',
        user: mockUser,
      }),
    ).toBe(true);

    expect(
      selectIsAuthenticated({
        ...useAuthStore.getState(),
        status: 'authenticated',
        user: null,
      }),
    ).toBe(false);

    expect(
      selectIsAuthenticated({
        ...useAuthStore.getState(),
        status: 'unauthenticated',
        user: mockUser,
      }),
    ).toBe(false);
  });
});
