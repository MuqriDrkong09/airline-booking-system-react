import { Navigate, Outlet } from 'react-router-dom';
import { APP_ROUTES } from '@/constants/routes';
import type { UserRole } from '@/types/auth';
import { UserRole as Roles } from '@/types/auth';
import { useAuth } from '../hooks/useAuth';

interface RoleRouteProps {
  allowedRoles: readonly UserRole[];
}

export function RoleRoute({ allowedRoles }: RoleRouteProps) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to={APP_ROUTES.public.login} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    const fallback =
      user.role === Roles.ADMIN ? APP_ROUTES.admin.dashboard : APP_ROUTES.customer.home;
    return <Navigate to={fallback} replace />;
  }

  return <Outlet />;
}
