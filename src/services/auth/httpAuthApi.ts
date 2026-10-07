import type { AxiosInstance } from 'axios';
import { API_ENDPOINTS, toAuthApiError } from '@/services/api';
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
import type { ChangePasswordRequest, UpdateProfileRequest } from '@/types/profile';
import type { AuthApi } from './authApi.types';

export function createHttpAuthApi(client: AxiosInstance): AuthApi {
  return {
    async login(payload: LoginRequest): Promise<AuthSession> {
      try {
        const { email, password } = payload;
        const { data } = await client.post<AuthSession>(API_ENDPOINTS.auth.login, {
          email,
          password,
        });
        return data;
      } catch (error) {
        throw toAuthApiError(error);
      }
    },

    async register(payload: RegisterRequest): Promise<MessageResponse> {
      try {
        const { data } = await client.post<MessageResponse>(
          API_ENDPOINTS.auth.register,
          payload,
        );
        return data;
      } catch (error) {
        throw toAuthApiError(error);
      }
    },

    async logout(): Promise<void> {
      try {
        await client.post(API_ENDPOINTS.auth.logout);
      } catch (error) {
        throw toAuthApiError(error);
      }
    },

    async getCurrentUser(): Promise<AuthUser> {
      try {
        const { data } = await client.get<AuthUser>(API_ENDPOINTS.auth.me);
        return data;
      } catch (error) {
        throw toAuthApiError(error);
      }
    },

    async updateProfile(payload: UpdateProfileRequest): Promise<AuthUser> {
      try {
        const { data } = await client.patch<AuthUser>(API_ENDPOINTS.auth.me, payload);
        return data;
      } catch (error) {
        throw toAuthApiError(error);
      }
    },

    async changePassword(payload: ChangePasswordRequest): Promise<MessageResponse> {
      try {
        const { data } = await client.post<MessageResponse>(
          API_ENDPOINTS.auth.changePassword,
          payload,
        );
        return data;
      } catch (error) {
        throw toAuthApiError(error);
      }
    },

    async forgotPassword(payload: ForgotPasswordRequest): Promise<MessageResponse> {
      try {
        const { data } = await client.post<MessageResponse>(
          API_ENDPOINTS.auth.forgotPassword,
          payload,
        );
        return data;
      } catch (error) {
        throw toAuthApiError(error);
      }
    },

    async resetPassword(payload: ResetPasswordRequest): Promise<MessageResponse> {
      try {
        const { data } = await client.post<MessageResponse>(
          API_ENDPOINTS.auth.resetPassword,
          payload,
        );
        return data;
      } catch (error) {
        throw toAuthApiError(error);
      }
    },

    async verifyEmail(payload: VerifyEmailRequest): Promise<MessageResponse> {
      try {
        const { data } = await client.post<MessageResponse>(
          API_ENDPOINTS.auth.verifyEmail,
          payload,
        );
        return data;
      } catch (error) {
        throw toAuthApiError(error);
      }
    },
  };
}
