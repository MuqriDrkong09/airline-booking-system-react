import { Link as RouterLink } from 'react-router-dom';
import { AppButton, ErrorState, PageContainer } from '@/components/common';
import { APP_ROUTES } from '@/constants/routes';

export function NotFoundPage() {
  return (
    <PageContainer>
      <ErrorState
        title="Page not found"
        message="The page you are looking for does not exist or has been moved."
        action={
          <AppButton component={RouterLink} to={APP_ROUTES.home} variant="contained" sx={{ mt: 1 }}>
            Back to home
          </AppButton>
        }
      />
    </PageContainer>
  );
}
