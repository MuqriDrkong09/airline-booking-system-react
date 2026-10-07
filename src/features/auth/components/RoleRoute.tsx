import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { PageLoader } from '@/components/common/PageLoader';
import { APP_ROUTES } from '@/constants/routes';
import type { UserRole } from '@/types/auth';
import { useAuth } from '../hooks/useAuth';
import { hasRole } from '../utils/rbac';

export interface RoleRouteProps {
  /** Roles permitted to render nested routes. */
  allowedRoles: readonly UserRole[];
}

/**
 * Reusable role guard. Nest under {@link ProtectedRoute} (or use alone).
 * Unauthenticated → login. Authenticated without an allowed role → 403.
 */
export function RoleRoute({ allowedRoles }: RoleRouteProps) {
  const { user, isAuthenticated, isBootstrapping } = useAuth();
  const location = useLocation();

  if (isBootstrapping) {
    return <PageLoader fullPage label="Checking authorization" />;
  }

  if (!isAuthenticated || !user) {
    return (
      <Navigate to={APP_ROUTES.public.login} replace state={{ from: location.pathname }} />
    );
  }

  if (!hasRole(user, allowedRoles)) {
    return (
      <Navigate
        to={APP_ROUTES.public.forbidden}
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return <Outlet />;
}
