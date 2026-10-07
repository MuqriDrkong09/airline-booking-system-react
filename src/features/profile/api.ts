import { userApi } from '@/services/userApi';
import type { AuthUser } from '@/types/auth';
import type { ChangePasswordRequest, UpdateProfileRequest } from '@/types/profile';

export const profileKeys = {
  all: ['profile'] as const,
  current: () => [...profileKeys.all, 'current'] as const,
};

export function fetchCurrentProfile(): Promise<AuthUser> {
  return userApi.getCurrentUser();
}

export function updateCurrentProfile(payload: UpdateProfileRequest): Promise<AuthUser> {
  return userApi.updateProfile(payload);
}

export function changeCurrentPassword(payload: ChangePasswordRequest): Promise<{ message: string }> {
  return userApi.changePassword(payload);
}
