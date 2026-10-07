import { isRouteErrorResponse, useNavigate, useRouteError } from 'react-router-dom';
import { ErrorState } from '@/components/common/ErrorState';
import { APP_ROUTES } from '@/constants/routes';
import {
  DEFAULT_ERROR_MESSAGE,
  getErrorMessage,
  getErrorTitle,
  HTTP_STATUS_MESSAGES,
  HTTP_STATUS_TITLES,
  logApiError,
} from '@/services/api';

function resolveRouteError(error: unknown): { title: string; message: string } {
  if (isRouteErrorResponse(error)) {
    return {
      title: HTTP_STATUS_TITLES[error.status] ?? 'We could not load this page',
      message:
        HTTP_STATUS_MESSAGES[error.status] ??
        DEFAULT_ERROR_MESSAGE,
    };
  }

  const title = getErrorTitle(error, 'We could not load this page');
  return {
    title: title === 'Something went wrong' ? 'We could not load this page' : title,
    message: getErrorMessage(error, DEFAULT_ERROR_MESSAGE),
  };
}

export function RouteErrorFallback() {
  const error = useRouteError();
  const navigate = useNavigate();
  const { title, message } = resolveRouteError(error);

  logApiError(error, { source: 'RouteErrorFallback' });

  return (
    <ErrorState
      title={title}
      message={message}
      onRetry={() => {
        void navigate(APP_ROUTES.public.home);
      }}
      retryLabel="Back to home"
    />
  );
}
