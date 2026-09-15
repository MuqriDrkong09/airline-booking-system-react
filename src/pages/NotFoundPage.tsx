import { Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { ErrorState } from '@/components/common/ErrorState';
import { APP_ROUTES } from '@/constants/routes';

export function NotFoundPage() {
  return (
    <ErrorState
      title="Page not found"
      message="The page you are looking for does not exist or has been moved."
      action={
        <Button component={RouterLink} to={APP_ROUTES.home} variant="contained" sx={{ mt: 1 }}>
          Back to home
        </Button>
      }
    />
  );
}
