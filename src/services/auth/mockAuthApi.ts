import type {
  AuthSession,
  AuthUser,
  ForgotPasswordRequest,
  LoginRequest,
  MessageResponse,
  RegisterRequest,
  ResetPasswordRequest,
  UserRole,
  VerifyEmailRequest,
} from '@/types/auth';
import type { ChangePasswordRequest, UpdateProfileRequest } from '@/types/profile';
import { DEFAULT_TRAVEL_PREFERENCES } from '@/types/profile';
import type { AuthApi } from './authApi.types';
import { AuthApiError } from './errors';

interface MockAccount {
  password: string;
  user: AuthUser;
}

const MOCK_DELAY_MS = 350;
const STORAGE_KEY = 'aerobook.mockAuth';

const DEFAULT_ACCOUNTS: Record<string, MockAccount> = {
  'user@example.com': {
    password: 'Password123!',
    user: {
      id: 'user-1',
      email: 'user@example.com',
      firstName: 'Alex',
      lastName: 'Traveler',
      role: 'USER',
      emailVerified: true,
      title: 'MR',
      phone: '+1 555 0100',
      dateOfBirth: '1990-04-12',
      nationality: 'US',
      travelPreferences: { ...DEFAULT_TRAVEL_PREFERENCES },
    },
  },
  'admin@example.com': {
    password: 'Password123!',
    user: {
      id: 'admin-1',
      email: 'admin@example.com',
      firstName: 'Jordan',
      lastName: 'Admin',
      role: 'ADMIN',
      emailVerified: true,
      title: 'MS',
      phone: '+1 555 0199',
      dateOfBirth: '1985-09-01',
      nationality: 'GB',
      travelPreferences: { ...DEFAULT_TRAVEL_PREFERENCES, preferredCabin: 'BUSINESS' },
    },
  },
};

interface MockPersistedState {
  accounts: Record<string, MockAccount>;
  sessions: Record<string, string>;
  resetTokens: Record<string, string>;
  verifyTokens: Record<string, string>;
}

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined';
}

function readPersistedState(): MockPersistedState {
  if (!canUseStorage()) {
    return {
      accounts: { ...DEFAULT_ACCOUNTS },
      sessions: {},
      resetTokens: {},
      verifyTokens: {},
    };
  }

  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        accounts: { ...DEFAULT_ACCOUNTS },
        sessions: {},
        resetTokens: {},
        verifyTokens: {},
      };
    }

    const parsed = JSON.parse(raw) as Partial<MockPersistedState>;
    return {
      accounts: { ...DEFAULT_ACCOUNTS, ...(parsed.accounts ?? {}) },
      sessions: parsed.sessions ?? {},
      resetTokens: parsed.resetTokens ?? {},
      verifyTokens: parsed.verifyTokens ?? {},
    };
  } catch {
    return {
      accounts: { ...DEFAULT_ACCOUNTS },
      sessions: {},
      resetTokens: {},
      verifyTokens: {},
    };
  }
}

function writePersistedState(state: MockPersistedState): void {
  if (!canUseStorage()) {
    return;
  }

  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

const persisted = readPersistedState();

function persist(): void {
  writePersistedState(persisted);
}

function delay(ms = MOCK_DELAY_MS): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function normalizeToken(token: string): string {
  return token.trim().replace(/^["']+|["']+$/g, '');
}

function createToken(prefix: string, email: string): string {
  return `${prefix}.${btoa(email)}.${Date.now()}`;
}

function createSession(user: AuthUser): AuthSession {
  const accessToken = createToken('access', user.email);
  const refreshToken = createToken('refresh', user.email);
  persisted.sessions[accessToken] = user.id;
  persist();

  return {
    user,
    tokens: {
      accessToken,
      refreshToken,
      expiresIn: 3600,
    },
  };
}

function findAccountById(userId: string): MockAccount | undefined {
  return Object.values(persisted.accounts).find((account) => account.user.id === userId);
}

function requirePasswordMatch(password: string, confirmPassword: string): void {
  if (password !== confirmPassword) {
    throw new AuthApiError('Passwords do not match.', {
      status: 400,
      code: 'PASSWORD_MISMATCH',
      fieldErrors: { confirmPassword: ['Passwords do not match.'] },
    });
  }
}

export const mockAuthApi: AuthApi = {
  async login(payload: LoginRequest): Promise<AuthSession> {
    await delay();
    const email = normalizeEmail(payload.email);
    const account = persisted.accounts[email];

    if (!account || account.password !== payload.password) {
      throw new AuthApiError('Invalid email or password.', {
        status: 401,
        code: 'INVALID_CREDENTIALS',
      });
    }

    if (!account.user.emailVerified) {
      throw new AuthApiError('Please verify your email before signing in.', {
        status: 403,
        code: 'EMAIL_NOT_VERIFIED',
      });
    }

    return createSession(account.user);
  },

  async register(payload: RegisterRequest): Promise<MessageResponse> {
    await delay();
    const email = normalizeEmail(payload.email);
    requirePasswordMatch(payload.password, payload.confirmPassword);

    if (!payload.termsAccepted) {
      throw new AuthApiError('You must accept the terms and conditions.', {
        status: 400,
        code: 'TERMS_REQUIRED',
        fieldErrors: { termsAccepted: ['You must accept the terms and conditions.'] },
      });
    }

    if (persisted.accounts[email]) {
      throw new AuthApiError('An account with this email already exists.', {
        status: 409,
        code: 'EMAIL_TAKEN',
        fieldErrors: { email: ['Email is already registered.'] },
      });
    }

    const user: AuthUser = {
      id: `user-${Object.keys(persisted.accounts).length + 1}`,
      email,
      firstName: payload.firstName.trim(),
      lastName: payload.lastName.trim(),
      role: 'USER' satisfies UserRole,
      emailVerified: false,
      title: payload.title,
      phone: payload.phone.trim(),
      dateOfBirth: payload.dateOfBirth,
      nationality: payload.nationality,
      travelPreferences: { ...DEFAULT_TRAVEL_PREFERENCES },
    };

    persisted.accounts[email] = { password: payload.password, user };
    const verifyToken = createToken('verify', email);
    persisted.verifyTokens[verifyToken] = email;
    persist();

    return {
      message: `Registration successful. Use verification token "${verifyToken}" to verify your email.`,
    };
  },

  async logout(): Promise<void> {
    await delay(150);
  },

  async getCurrentUser(): Promise<AuthUser> {
    await delay(200);
    throw new AuthApiError('Unauthorized.', { status: 401, code: 'UNAUTHORIZED' });
  },

  async updateProfile(_payload: UpdateProfileRequest): Promise<AuthUser> {
    await delay();
    throw new AuthApiError('Unauthorized.', { status: 401, code: 'UNAUTHORIZED' });
  },

  async changePassword(_payload: ChangePasswordRequest): Promise<MessageResponse> {
    await delay();
    throw new AuthApiError('Unauthorized.', { status: 401, code: 'UNAUTHORIZED' });
  },

  async forgotPassword(payload: ForgotPasswordRequest): Promise<MessageResponse> {
    await delay();
    const email = normalizeEmail(payload.email);
    const account = persisted.accounts[email];

    if (account) {
      const token = createToken('reset', email);
      persisted.resetTokens[token] = email;
      persist();
      return {
        message: `If an account exists, a reset link was sent. Demo token: "${token}" — open /reset-password and paste it.`,
      };
    }

    return {
      message: 'If an account exists for that email, password reset instructions were sent.',
    };
  },

  async resetPassword(payload: ResetPasswordRequest): Promise<MessageResponse> {
    await delay();
    requirePasswordMatch(payload.password, payload.confirmPassword);

    const token = normalizeToken(payload.token);
    const email = persisted.resetTokens[token];
    if (!email) {
      throw new AuthApiError('Invalid or expired reset token.', {
        status: 400,
        code: 'INVALID_RESET_TOKEN',
      });
    }

    const account = persisted.accounts[email];
    if (!account) {
      throw new AuthApiError('Account not found.', { status: 404, code: 'NOT_FOUND' });
    }

    account.password = payload.password;
    delete persisted.resetTokens[token];
    persist();

    return { message: 'Password has been reset. You can now sign in.' };
  },

  async verifyEmail(payload: VerifyEmailRequest): Promise<MessageResponse> {
    await delay();
    const token = normalizeToken(payload.token);
    const email = persisted.verifyTokens[token];
    if (!email) {
      throw new AuthApiError('Invalid or expired verification token.', {
        status: 400,
        code: 'INVALID_VERIFY_TOKEN',
      });
    }

    const account = persisted.accounts[email];
    if (!account) {
      throw new AuthApiError('Account not found.', { status: 404, code: 'NOT_FOUND' });
    }

    account.user = { ...account.user, emailVerified: true };
    delete persisted.verifyTokens[token];
    persist();

    return { message: 'Email verified successfully. You can now sign in.' };
  },
};

export function createMockAuthApiWithSessionLookup(
  getAccessToken: () => string | null,
): AuthApi {
  function requireAccount(): MockAccount {
    const token = getAccessToken();
    if (!token) {
      throw new AuthApiError('Unauthorized.', { status: 401, code: 'UNAUTHORIZED' });
    }

    const userId = persisted.sessions[token];
    const account = userId ? findAccountById(userId) : undefined;

    if (!account) {
      throw new AuthApiError('Unauthorized.', { status: 401, code: 'UNAUTHORIZED' });
    }

    return account;
  }

  return {
    ...mockAuthApi,
    async getCurrentUser(): Promise<AuthUser> {
      await delay(200);
      return requireAccount().user;
    },
    async updateProfile(payload: UpdateProfileRequest): Promise<AuthUser> {
      await delay();
      const account = requireAccount();

      account.user = {
        ...account.user,
        title: payload.title as AuthUser['title'],
        firstName: payload.firstName.trim(),
        lastName: payload.lastName.trim(),
        phone: payload.phone.trim(),
        dateOfBirth: payload.dateOfBirth,
        nationality: payload.nationality,
        travelPreferences: { ...payload.travelPreferences },
      };
      persist();

      return account.user;
    },
    async changePassword(payload: ChangePasswordRequest): Promise<MessageResponse> {
      await delay();
      const account = requireAccount();
      requirePasswordMatch(payload.newPassword, payload.confirmPassword);

      if (account.password !== payload.currentPassword) {
        throw new AuthApiError('Current password is incorrect.', {
          status: 400,
          code: 'INVALID_CURRENT_PASSWORD',
          fieldErrors: { currentPassword: ['Current password is incorrect.'] },
        });
      }

      account.password = payload.newPassword;
      persist();

      return { message: 'Password updated successfully.' };
    },
    async logout(): Promise<void> {
      await delay(150);
      const token = getAccessToken();
      if (token) {
        delete persisted.sessions[token];
        persist();
      }
    },
  };
}
