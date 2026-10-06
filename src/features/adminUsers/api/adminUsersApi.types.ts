import type { UserRole } from '@/types/auth';
import type { AdminUser, AdminUserFilters } from '../types/adminUser';

export interface AdminUsersApi {
  listUsers: (filters?: AdminUserFilters) => Promise<AdminUser[]>;
  getUser: (userId: string) => Promise<AdminUser>;
  setUserActive: (
    userId: string,
    active: boolean,
    actorUserId: string,
  ) => Promise<AdminUser>;
  changeUserRole: (
    userId: string,
    role: UserRole,
    actorUserId: string,
  ) => Promise<AdminUser>;
}
