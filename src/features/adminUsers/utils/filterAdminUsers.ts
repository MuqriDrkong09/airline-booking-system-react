import type { AdminUser, AdminUserFilters } from '../types/adminUser';

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

export function filterAdminUsers(
  users: readonly AdminUser[],
  filters: AdminUserFilters,
): AdminUser[] {
  const search = normalize(filters.search);

  return users.filter((user) => {
    if (filters.role && user.role !== filters.role) {
      return false;
    }

    if (filters.active === 'active' && !user.active) {
      return false;
    }
    if (filters.active === 'inactive' && user.active) {
      return false;
    }

    if (!search) {
      return true;
    }

    const haystack = [
      user.id,
      user.email,
      user.firstName,
      user.lastName,
      user.phone,
      user.nationality,
      user.role,
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(search);
  });
}

export function sortAdminUsers(users: readonly AdminUser[]): AdminUser[] {
  return [...users].sort((left, right) => {
    const byLast = left.lastName.localeCompare(right.lastName);
    if (byLast !== 0) {
      return byLast;
    }
    const byFirst = left.firstName.localeCompare(right.firstName);
    if (byFirst !== 0) {
      return byFirst;
    }
    return left.email.localeCompare(right.email);
  });
}
