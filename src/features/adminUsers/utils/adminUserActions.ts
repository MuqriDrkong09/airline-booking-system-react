import { UserRole } from '@/types/auth';
import type { AdminUser } from '../types/adminUser';

export function getAdminUserDisplayName(user: AdminUser): string {
  return `${user.firstName} ${user.lastName}`.trim();
}

export function getAdminUserRoleLabel(role: AdminUser['role']): string {
  return role === UserRole.ADMIN ? 'Administrator' : 'Customer';
}

export function getAdminUserActiveLabel(active: boolean): string {
  return active ? 'Active' : 'Inactive';
}

export function isSelfAdminUser(user: AdminUser, actorUserId: string | null | undefined): boolean {
  return Boolean(actorUserId) && user.id === actorUserId;
}

/**
 * Admins cannot deactivate their own account.
 */
export function canDeactivateAdminUser(
  user: AdminUser,
  actorUserId: string | null | undefined,
): boolean {
  if (!user.active) {
    return false;
  }
  return !isSelfAdminUser(user, actorUserId);
}

export function canActivateAdminUser(user: AdminUser): boolean {
  return !user.active;
}

/**
 * Admins cannot remove their own ADMIN role.
 */
export function canChangeAdminUserRole(
  user: AdminUser,
  nextRole: AdminUser['role'],
  actorUserId: string | null | undefined,
): boolean {
  if (user.role === nextRole) {
    return false;
  }
  if (isSelfAdminUser(user, actorUserId) && user.role === UserRole.ADMIN && nextRole !== UserRole.ADMIN) {
    return false;
  }
  return true;
}

export function assertCanSetAdminUserActive(
  user: AdminUser,
  active: boolean,
  actorUserId: string | null | undefined,
): void {
  if (active) {
    return;
  }
  if (isSelfAdminUser(user, actorUserId)) {
    throw new Error('You cannot deactivate your own account.');
  }
}

export function assertCanChangeAdminUserRole(
  user: AdminUser,
  nextRole: AdminUser['role'],
  actorUserId: string | null | undefined,
): void {
  if (user.role === nextRole) {
    throw new Error('User already has this role.');
  }
  if (
    isSelfAdminUser(user, actorUserId) &&
    user.role === UserRole.ADMIN &&
    nextRole !== UserRole.ADMIN
  ) {
    throw new Error('You cannot remove your own administrator access.');
  }
}
