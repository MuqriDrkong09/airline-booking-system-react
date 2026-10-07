import type { AuthUser } from '@/types/auth';
import { UserRole } from '@/types/auth';
import { APP_ROUTES } from '@/constants/routes';

export function getDisplayName(user: AuthUser): string {
  return `${user.firstName} ${user.lastName}`.trim();
}

export function getRoleLabel(role: AuthUser['role']): string {
  return role === UserRole.ADMIN ? 'Administrator' : 'Customer';
}

export function getPostLoginRedirect(role: AuthUser['role'], from?: string | null): string {
  if (from && from !== APP_ROUTES.public.login && from !== APP_ROUTES.public.forbidden) {
    // ADMIN may use customer and admin areas; USER may only return to customer paths.
    if (role === UserRole.ADMIN) {
      if (
        from.startsWith(APP_ROUTES.admin.root) ||
        from.startsWith(APP_ROUTES.customer.root)
      ) {
        return from;
      }
    } else if (from.startsWith(APP_ROUTES.customer.root)) {
      return from;
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
