import { authApi } from '@/services/auth';
import type { AuthUser } from '@/types/auth';
import type { ChangePasswordRequest, UpdateProfileRequest } from '@/types/profile';

export const profileKeys = {
  all: ['profile'] as const,
  current: () => [...profileKeys.all, 'current'] as const,
};

export function fetchCurrentProfile(): Promise<AuthUser> {
  return authApi.getCurrentUser();
}

export function updateCurrentProfile(payload: UpdateProfileRequest): Promise<AuthUser> {
  return authApi.updateProfile(payload);
}

export function changeCurrentPassword(payload: ChangePasswordRequest): Promise<{ message: string }> {
  return authApi.changePassword(payload);
}
