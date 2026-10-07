import { APP_ROUTES } from '@/constants/routes';
import type { AuthUser, UserRole } from '@/types/auth';
import { UserRole as Roles } from '@/types/auth';

/**
 * Frontend RBAC helpers for route/UI gating only.
 * Backend APIs must still enforce authorization independently.
 */

/** Roles that may access customer (`/app`) pages. */
export const CUSTOMER_AREA_ROLES = [Roles.USER, Roles.ADMIN] as const;

/** Roles that may access admin (`/admin`) pages. */
export const ADMIN_AREA_ROLES = [Roles.ADMIN] as const;

export type CustomerAreaRole = (typeof CUSTOMER_AREA_ROLES)[number];
export type AdminAreaRole = (typeof ADMIN_AREA_ROLES)[number];

export function hasRole(
  user: Pick<AuthUser, 'role'> | null | undefined,
  allowedRoles: readonly UserRole[],
): boolean {
  if (!user) {
    return false;
  }
  return allowedRoles.includes(user.role);
}

export function canAccessCustomerArea(
  user: Pick<AuthUser, 'role'> | null | undefined,
): boolean {
  return hasRole(user, CUSTOMER_AREA_ROLES);
}

export function canAccessAdminArea(
  user: Pick<AuthUser, 'role'> | null | undefined,
): boolean {
  return hasRole(user, ADMIN_AREA_ROLES);
}

export function getHomePathForRole(role: UserRole): string {
  return role === Roles.ADMIN ? APP_ROUTES.admin.dashboard : APP_ROUTES.customer.home;
}
