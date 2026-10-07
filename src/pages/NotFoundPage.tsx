import { Link as RouterLink } from 'react-router-dom';
import { AppButton, ErrorState, PageContainer } from '@/components/common';
import { APP_ROUTES } from '@/constants/routes';
import { HTTP_STATUS_MESSAGES } from '@/services/api';

export function NotFoundPage() {
  return (
    <PageContainer>
      <ErrorState
        title="404 — Page not found"
        message={`${HTTP_STATUS_MESSAGES[404]} The page you are looking for does not exist or has been moved.`}
        action={
          <AppButton
            component={RouterLink}
            to={APP_ROUTES.public.home}
            variant="contained"
            sx={{ mt: 1 }}
          >
            Back to home
          </AppButton>
        }
      />
    </PageContainer>
  );
}
