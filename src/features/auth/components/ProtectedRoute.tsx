import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { PageLoader } from '@/components/common/PageLoader';
import { APP_ROUTES } from '@/constants/routes';
import { useAuth } from '../hooks/useAuth';

export function ProtectedRoute() {
  const { isAuthenticated, isBootstrapping } = useAuth();
  const location = useLocation();

  if (isBootstrapping) {
    return <PageLoader fullPage label="Checking authentication" />;
  }

  if (!isAuthenticated) {
    return (
      <Navigate to={APP_ROUTES.public.login} replace state={{ from: location.pathname }} />
    );
  }

  return <Outlet />;
}
