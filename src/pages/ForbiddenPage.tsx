import { Link as RouterLink, Navigate } from 'react-router-dom';
import { ShieldBan } from 'lucide-react';
import { AppButton, ErrorState, PageContainer, PageLoader } from '@/components/common';
import { APP_ROUTES } from '@/constants/routes';
import { getHomePathForRole, useAuth } from '@/features/auth';
import { HTTP_STATUS_MESSAGES } from '@/services/api';

export function ForbiddenPage() {
  const { user, isAuthenticated, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return <PageLoader fullPage label="Checking authorization" />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to={APP_ROUTES.public.unauthorized} replace />;
  }

  const homePath = getHomePathForRole(user.role);

  return (
    <PageContainer>
      <ErrorState
        title="403 — Access denied"
        message={`${HTTP_STATUS_MESSAGES[403]} Authorization is also enforced by the API.`}
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
