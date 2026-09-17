import type { AxiosInstance } from 'axios';
import type {
  AuthSession,
  AuthUser,
  ForgotPasswordRequest,
  LoginRequest,
  MessageResponse,
  RegisterRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
} from '@/types/auth';
import type { AuthApi } from './authApi.types';
import { toAuthApiError } from './errors';

export function createHttpAuthApi(client: AxiosInstance): AuthApi {
  return {
    async login(payload: LoginRequest): Promise<AuthSession> {
      try {
        const { email, password } = payload;
        const { data } = await client.post<AuthSession>('/auth/login', { email, password });
        return data;
      } catch (error) {
        throw toAuthApiError(error);
      }
    },

    async register(payload: RegisterRequest): Promise<MessageResponse> {
      try {
        const { data } = await client.post<MessageResponse>('/auth/register', payload);
        return data;
      } catch (error) {
        throw toAuthApiError(error);
      }
    },

    async logout(): Promise<void> {
      try {
        await client.post('/auth/logout');
      } catch (error) {
        throw toAuthApiError(error);
      }
    },

    async getCurrentUser(): Promise<AuthUser> {
      try {
        const { data } = await client.get<AuthUser>('/auth/me');
        return data;
      } catch (error) {
        throw toAuthApiError(error);
      }
    },

    async forgotPassword(payload: ForgotPasswordRequest): Promise<MessageResponse> {
      try {
        const { data } = await client.post<MessageResponse>('/auth/forgot-password', payload);
        return data;
      } catch (error) {
        throw toAuthApiError(error);
      }
    },

    async resetPassword(payload: ResetPasswordRequest): Promise<MessageResponse> {
      try {
        const { data } = await client.post<MessageResponse>('/auth/reset-password', payload);
        return data;
      } catch (error) {
        throw toAuthApiError(error);
      }
    },

    async verifyEmail(payload: VerifyEmailRequest): Promise<MessageResponse> {
      try {
        const { data } = await client.post<MessageResponse>('/auth/verify-email', payload);
        return data;
      } catch (error) {
        throw toAuthApiError(error);
      }
    },
  };
}
