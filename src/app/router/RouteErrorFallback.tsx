import { isRouteErrorResponse, useNavigate, useRouteError } from 'react-router-dom';
import { ErrorState } from '@/components/common/ErrorState';
import { APP_ROUTES } from '@/constants/routes';

function getErrorMessage(error: unknown): string {
  if (isRouteErrorResponse(error)) {
    return error.statusText || `Request failed with status ${error.status}.`;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'An unexpected error occurred.';
}

export function RouteErrorFallback() {
  const error = useRouteError();
  const navigate = useNavigate();

  return (
    <ErrorState
      title="We could not load this page"
      message={getErrorMessage(error)}
      onRetry={() => {
        void navigate(APP_ROUTES.public.home);
      }}
      retryLabel="Back to home"
    />
  );
}
