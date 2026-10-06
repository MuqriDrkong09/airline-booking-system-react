import type { UserRole, UserTitle } from '@/types/auth';

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  active: boolean;
  emailVerified: boolean;
  title?: UserTitle;
  phone?: string;
  dateOfBirth?: string;
  nationality?: string;
  createdAt: string;
}

export interface AdminUserFilters {
  search: string;
  role: '' | UserRole;
  active: '' | 'active' | 'inactive';
}

export const EMPTY_ADMIN_USER_FILTERS: AdminUserFilters = {
  search: '',
  role: '',
  active: '',
};
