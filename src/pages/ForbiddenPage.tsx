import { Link as RouterLink, Navigate } from 'react-router-dom';
import { ShieldBan } from 'lucide-react';
import { AppButton, ErrorState, PageContainer, PageLoader } from '@/components/common';
import { APP_ROUTES } from '@/constants/routes';
import { getHomePathForRole, useAuth } from '@/features/auth';

export function ForbiddenPage() {
  const { user, isAuthenticated, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return <PageLoader fullPage label="Checking authorization" />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to={APP_ROUTES.public.login} replace />;
  }

  const homePath = getHomePathForRole(user.role);

  return (
    <PageContainer>
      <ErrorState
        title="403 — Access denied"
        message="You are signed in, but your account does not have permission to view this page. Authorization is also enforced by the API."
        icon={<ShieldBan aria-hidden="true" size={40} />}
        action={
          <AppButton
            component={RouterLink}
            to={homePath}
            variant="contained"
            sx={{ mt: 1 }}
          >
            Go to your home
          </AppButton>
        }
      />
    </PageContainer>
  );
}
