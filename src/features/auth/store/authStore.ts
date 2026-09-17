import { create } from 'zustand';
import {
  authApi,
  getErrorMessage,
  tokenStorage,
  type AuthApi,
  type TokenStorage,
} from '@/services/auth';
import type {
  AuthUser,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
} from '@/types/auth';

export type AuthStatus = 'idle' | 'authenticated' | 'unauthenticated';

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  status: AuthStatus;
  isBootstrapping: boolean;
  isSubmitting: boolean;
  error: string | null;
  bootstrap: () => Promise<void>;
  login: (payload: LoginRequest) => Promise<AuthUser>;
  register: (payload: RegisterRequest) => Promise<string>;
  logout: () => Promise<void>;
  forgotPassword: (payload: ForgotPasswordRequest) => Promise<string>;
  resetPassword: (payload: ResetPasswordRequest) => Promise<string>;
  verifyEmail: (payload: VerifyEmailRequest) => Promise<string>;
  clearError: () => void;
}

interface AuthStoreOptions {
  api?: AuthApi;
  storage?: TokenStorage;
}

function persistSession(storage: TokenStorage, accessToken: string, refreshToken: string): void {
  storage.setAccessToken(accessToken);
  storage.setRefreshToken(refreshToken);
}

function clearSession(storage: TokenStorage): void {
  storage.clear();
}

export function createAuthStore(options: AuthStoreOptions = {}) {
  const api = options.api ?? authApi;
  const storage = options.storage ?? tokenStorage;

  return create<AuthState>((set) => ({
    user: null,
    accessToken: null,
    status: 'idle',
    isBootstrapping: true,
    isSubmitting: false,
    error: null,

    clearError: () => set({ error: null }),

    bootstrap: async () => {
      const accessToken = storage.getAccessToken();

      if (!accessToken) {
        set({
          user: null,
          accessToken: null,
          status: 'unauthenticated',
          isBootstrapping: false,
          error: null,
        });
        return;
      }

      set({ isBootstrapping: true, error: null, accessToken });

      try {
        const user = await api.getCurrentUser();
        set({
          user,
          accessToken,
          status: 'authenticated',
          isBootstrapping: false,
          error: null,
        });
      } catch {
        clearSession(storage);
        set({
          user: null,
          accessToken: null,
          status: 'unauthenticated',
          isBootstrapping: false,
          error: null,
        });
      }
    },

    login: async (payload) => {
      set({ isSubmitting: true, error: null });

      try {
        const { rememberMe = false, ...credentials } = payload;
        storage.setRememberSession?.(rememberMe);

        const session = await api.login(credentials);
        persistSession(storage, session.tokens.accessToken, session.tokens.refreshToken);
        set({
          user: session.user,
          accessToken: session.tokens.accessToken,
          status: 'authenticated',
          isSubmitting: false,
          error: null,
        });
        return session.user;
      } catch (error) {
        set({ isSubmitting: false, error: getErrorMessage(error, 'Unable to sign in.') });
        throw error;
      }
    },

    register: async (payload) => {
      set({ isSubmitting: true, error: null });

      try {
        const response = await api.register(payload);
        set({ isSubmitting: false, error: null });
        return response.message;
      } catch (error) {
        set({ isSubmitting: false, error: getErrorMessage(error, 'Unable to register.') });
        throw error;
      }
    },

    logout: async () => {
      set({ isSubmitting: true, error: null });

      try {
        await api.logout();
      } catch {
        // Always clear local session even if the API call fails.
      } finally {
        clearSession(storage);
        set({
          user: null,
          accessToken: null,
          status: 'unauthenticated',
          isSubmitting: false,
          error: null,
          isBootstrapping: false,
        });
      }
    },

    forgotPassword: async (payload) => {
      set({ isSubmitting: true, error: null });

      try {
        const response = await api.forgotPassword(payload);
        set({ isSubmitting: false, error: null });
        return response.message;
      } catch (error) {
        set({
          isSubmitting: false,
          error: getErrorMessage(error, 'Unable to start password reset.'),
        });
        throw error;
      }
    },

    resetPassword: async (payload) => {
      set({ isSubmitting: true, error: null });

      try {
        const response = await api.resetPassword(payload);
        set({ isSubmitting: false, error: null });
        return response.message;
      } catch (error) {
        set({
          isSubmitting: false,
          error: getErrorMessage(error, 'Unable to reset password.'),
        });
        throw error;
      }
    },

    verifyEmail: async (payload) => {
      set({ isSubmitting: true, error: null });

      try {
        const response = await api.verifyEmail(payload);
        set({ isSubmitting: false, error: null });
        return response.message;
      } catch (error) {
        set({
          isSubmitting: false,
          error: getErrorMessage(error, 'Unable to verify email.'),
        });
        throw error;
      }
    },
  }));
}

export const useAuthStore = createAuthStore();

export function selectIsAuthenticated(state: AuthState): boolean {
  return state.status === 'authenticated' && state.user !== null;
}
