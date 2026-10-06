import type { UserRole } from '@/types/auth';
import {
  assertCanChangeAdminUserRole,
  assertCanSetAdminUserActive,
} from '../utils/adminUserActions';
import { filterAdminUsers, sortAdminUsers } from '../utils/filterAdminUsers';
import type { AdminUser, AdminUserFilters } from '../types/adminUser';
import type { AdminUsersApi } from './adminUsersApi.types';
import { createSeedAdminUsers } from './adminUsersData';

const MOCK_DELAY_MS = process.env.NODE_ENV === 'test' ? 0 : 250;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function cloneUser(user: AdminUser): AdminUser {
  return { ...user };
}

export function createMockAdminUsersApi(
  options: { delayMs?: number; initialUsers?: AdminUser[] } = {},
): AdminUsersApi & {
  reset: () => void;
  getState: () => AdminUser[];
} {
  const delayMs = options.delayMs ?? MOCK_DELAY_MS;
  let users = (options.initialUsers ?? createSeedAdminUsers()).map(cloneUser);

  return {
    reset() {
      users = (options.initialUsers ?? createSeedAdminUsers()).map(cloneUser);
    },
    getState() {
      return users.map(cloneUser);
    },
    async listUsers(filters?: AdminUserFilters): Promise<AdminUser[]> {
      await delay(delayMs);
      const source = sortAdminUsers(users.map(cloneUser));
      if (!filters) {
        return source;
      }
      return filterAdminUsers(source, filters);
    },
    async getUser(userId: string): Promise<AdminUser> {
      await delay(delayMs);
      const user = users.find((item) => item.id === userId);
      if (!user) {
        throw new Error('User not found');
      }
      return cloneUser(user);
    },
    async setUserActive(
      userId: string,
      active: boolean,
      actorUserId: string,
    ): Promise<AdminUser> {
      await delay(delayMs);
      const index = users.findIndex((item) => item.id === userId);
      if (index < 0) {
        throw new Error('User not found');
      }
      const current = users[index]!;
      assertCanSetAdminUserActive(current, active, actorUserId);
      const updated: AdminUser = { ...current, active };
      users = users.map((item, itemIndex) => (itemIndex === index ? updated : item));
      return cloneUser(updated);
    },
    async changeUserRole(
      userId: string,
      role: UserRole,
      actorUserId: string,
    ): Promise<AdminUser> {
      await delay(delayMs);
      const index = users.findIndex((item) => item.id === userId);
      if (index < 0) {
        throw new Error('User not found');
      }
      const current = users[index]!;
      assertCanChangeAdminUserRole(current, role, actorUserId);
      const updated: AdminUser = { ...current, role };
      users = users.map((item, itemIndex) => (itemIndex === index ? updated : item));
      return cloneUser(updated);
    },
  };
}

export const mockAdminUsersApi = createMockAdminUsersApi();
