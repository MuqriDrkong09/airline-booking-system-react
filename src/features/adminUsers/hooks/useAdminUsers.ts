import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { UserRole } from '@/types/auth';
import {
  adminUserKeys,
  changeAdminUserRole,
  listAdminUsers,
  setAdminUserActive,
} from '../api';
import type { AdminUserFilters } from '../types/adminUser';

export function useAdminUsersQuery(filters: AdminUserFilters, enabled = true) {
  return useQuery({
    queryKey: adminUserKeys.list(filters),
    queryFn: () => listAdminUsers(filters),
    enabled,
  });
}

export function useSetAdminUserActiveMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      active,
      actorUserId,
    }: {
      userId: string;
      active: boolean;
      actorUserId: string;
    }) => setAdminUserActive(userId, active, actorUserId),
    onSuccess: async (user) => {
      await queryClient.invalidateQueries({ queryKey: adminUserKeys.lists() });
      queryClient.setQueryData(adminUserKeys.detail(user.id), user);
    },
  });
}

export function useChangeAdminUserRoleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      role,
      actorUserId,
    }: {
      userId: string;
      role: UserRole;
      actorUserId: string;
    }) => changeAdminUserRole(userId, role, actorUserId),
    onSuccess: async (user) => {
      await queryClient.invalidateQueries({ queryKey: adminUserKeys.lists() });
      queryClient.setQueryData(adminUserKeys.detail(user.id), user);
    },
  });
}
