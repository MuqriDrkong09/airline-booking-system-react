import { APP_ROUTES } from '@/constants/routes';
import type { TokenStorage } from '@/services/auth/tokenStorage';
import { tokenStorage } from '@/services/auth/tokenStorage';
import { toSafeInternalPath } from '@/utils/safeInternalPath';

export interface HandleUnauthorizedOptions {
  storage?: TokenStorage;
  /** Current path preserved as `from` when redirecting. */
  fromPath?: string;
  /** Skip redirect (e.g. already on login / unauthorized). */
  skipRedirect?: boolean;
}

const RETURN_PATH_ROOTS = [APP_ROUTES.customer.root, APP_ROUTES.admin.root] as const;

/**
 * Clears the local session after a 401 from a protected API call.
 * Redirects to the unauthorized page so the user sees a friendly message.
 */
export function handleUnauthorizedSession(
  options: HandleUnauthorizedOptions = {},
): void {
  const storage = options.storage ?? tokenStorage;
  storage.clear();

  if (options.skipRedirect || typeof window === 'undefined') {
    return;
  }

  const currentPath = options.fromPath ?? `${window.location.pathname}${window.location.search}`;
  if (
    currentPath.startsWith(APP_ROUTES.public.login) ||
    currentPath.startsWith(APP_ROUTES.public.unauthorized) ||
    currentPath.startsWith(APP_ROUTES.public.register)
  ) {
    return;
  }

  const params = new URLSearchParams();
  const safeFrom = toSafeInternalPath(currentPath, RETURN_PATH_ROOTS);
  if (safeFrom) {
    params.set('from', safeFrom);
  }
  const query = params.toString();
  window.location.assign(
    query
      ? `${APP_ROUTES.public.unauthorized}?${query}`
      : APP_ROUTES.public.unauthorized,
  );
}
