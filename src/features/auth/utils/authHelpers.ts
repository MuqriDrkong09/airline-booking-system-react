import type { AuthUser } from '@/types/auth';
import { UserRole } from '@/types/auth';
import { APP_ROUTES } from '@/constants/routes';
import { toSafeInternalPath } from '@/utils/safeInternalPath';

export function getDisplayName(user: AuthUser): string {
  return `${user.firstName} ${user.lastName}`.trim();
}

export function getRoleLabel(role: AuthUser['role']): string {
  return role === UserRole.ADMIN ? 'Administrator' : 'Customer';
}

function allowedReturnRoots(role: AuthUser['role']): readonly string[] {
  return role === UserRole.ADMIN
    ? [APP_ROUTES.admin.root, APP_ROUTES.customer.root]
    : [APP_ROUTES.customer.root];
}

export function getPostLoginRedirect(role: AuthUser['role'], from?: string | null): string {
  if (from && from !== APP_ROUTES.public.login && from !== APP_ROUTES.public.forbidden) {
    const safe = toSafeInternalPath(from, allowedReturnRoots(role));
    if (safe) {
      return safe;
    }
  }

  return role === UserRole.ADMIN ? APP_ROUTES.admin.dashboard : APP_ROUTES.customer.home;
}

export function toUserMenuModel(user: AuthUser) {
  return {
    name: getDisplayName(user),
    email: user.email,
    roleLabel: getRoleLabel(user.role),
  };
}

/** Extracts a quoted demo token from mock auth success messages. */
export function extractDemoToken(message: string): string | null {
  const match = /"([^"]+)"/.exec(message);
  return match?.[1] ?? null;
}
