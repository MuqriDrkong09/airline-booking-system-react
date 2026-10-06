import type { AxiosInstance } from 'axios';
import { apiClient } from '@/services/api/client';
import type { UserRole } from '@/types/auth';
import type { AdminUser, AdminUserFilters } from '../types/adminUser';
import type { AdminUsersApi } from './adminUsersApi.types';

function toQuery(filters?: AdminUserFilters): Record<string, string> | undefined {
  if (!filters) {
    return undefined;
  }

  const params: Record<string, string> = {};
  if (filters.search.trim()) params.search = filters.search.trim();
  if (filters.role) params.role = filters.role;
  if (filters.active) params.active = filters.active;
  return Object.keys(params).length > 0 ? params : undefined;
}

export function createHttpAdminUsersApi(client: AxiosInstance = apiClient): AdminUsersApi {
  return {
    async listUsers(filters?: AdminUserFilters): Promise<AdminUser[]> {
      const { data } = await client.get<AdminUser[]>('/admin/users', {
        params: toQuery(filters),
      });
      return data;
    },
    async getUser(userId: string): Promise<AdminUser> {
      const { data } = await client.get<AdminUser>(
        `/admin/users/${encodeURIComponent(userId)}`,
      );
      return data;
    },
    async setUserActive(
      userId: string,
      active: boolean,
      _actorUserId: string,
    ): Promise<AdminUser> {
      const { data } = await client.patch<AdminUser>(
        `/admin/users/${encodeURIComponent(userId)}/active`,
        { active },
      );
      return data;
    },
    async changeUserRole(
      userId: string,
      role: UserRole,
      _actorUserId: string,
    ): Promise<AdminUser> {
      const { data } = await client.patch<AdminUser>(
        `/admin/users/${encodeURIComponent(userId)}/role`,
        { role },
      );
      return data;
    },
  };
}
