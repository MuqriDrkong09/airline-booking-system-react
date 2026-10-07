import { authApi } from '@/services/authApi';
import type { AuthUser } from '@/types/auth';
import type { ChangePasswordRequest, UpdateProfileRequest } from '@/types/profile';

export interface UserApi {
  getCurrentUser(): Promise<AuthUser>;
  updateProfile(payload: UpdateProfileRequest): Promise<AuthUser>;
  changePassword(payload: ChangePasswordRequest): Promise<{ message: string }>;
}

/**
 * Domain service: current user / profile.
 * Delegates to auth endpoints (`/auth/me`, change-password).
 */
export const userApi: UserApi = {
  getCurrentUser: () => authApi.getCurrentUser(),
  updateProfile: (payload) => authApi.updateProfile(payload),
  changePassword: (payload) => authApi.changePassword(payload),
};
