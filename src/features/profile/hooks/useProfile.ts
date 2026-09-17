import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth';
import { getErrorMessage } from '@/services/auth';
import type { AuthUser } from '@/types/auth';
import type { ChangePasswordRequest, UpdateProfileRequest } from '@/types/profile';
import {
  changeCurrentPassword,
  fetchCurrentProfile,
  profileKeys,
  updateCurrentProfile,
} from '../api';

export function useProfileQuery(enabled = true) {
  return useQuery({
    queryKey: profileKeys.current(),
    queryFn: fetchCurrentProfile,
    enabled,
  });
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProfileRequest) => updateCurrentProfile(payload),
    onSuccess: (user: AuthUser) => {
      queryClient.setQueryData(profileKeys.current(), user);
      useAuthStore.setState({ user });
    },
  });
}

export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: (payload: ChangePasswordRequest) => changeCurrentPassword(payload),
  });
}

export function getMutationErrorMessage(error: unknown, fallback: string): string {
  return getErrorMessage(error, fallback);
}
