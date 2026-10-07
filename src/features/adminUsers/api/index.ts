import { adminApi } from '@/services/adminApi';
import type { UserRole } from '@/types/auth';
import type { AdminUser, AdminUserFilters } from '../types/adminUser';
import type { AdminUsersApi } from './adminUsersApi.types';

export const adminUsersApi: AdminUsersApi = adminApi.users;

export const adminUserKeys = {
  all: ['admin-users'] as const,
  lists: () => [...adminUserKeys.all, 'list'] as const,
  list: (filters?: AdminUserFilters) => [...adminUserKeys.lists(), filters ?? {}] as const,
  details: () => [...adminUserKeys.all, 'detail'] as const,
  detail: (userId: string) => [...adminUserKeys.details(), userId] as const,
};

export function listAdminUsers(filters?: AdminUserFilters): Promise<AdminUser[]> {
  return adminUsersApi.listUsers(filters);
}

export function getAdminUser(userId: string): Promise<AdminUser> {
  return adminUsersApi.getUser(userId);
}

export function setAdminUserActive(
  userId: string,
  active: boolean,
  actorUserId: string,
): Promise<AdminUser> {
  return adminUsersApi.setUserActive(userId, active, actorUserId);
}

export function changeAdminUserRole(
  userId: string,
  role: UserRole,
  actorUserId: string,
): Promise<AdminUser> {
  return adminUsersApi.changeUserRole(userId, role, actorUserId);
}

export type { AdminUsersApi } from './adminUsersApi.types';
export { createHttpAdminUsersApi } from './httpAdminUsersApi';
export { createMockAdminUsersApi, mockAdminUsersApi } from './mockAdminUsersApi';
export { createSeedAdminUsers } from './adminUsersData';
