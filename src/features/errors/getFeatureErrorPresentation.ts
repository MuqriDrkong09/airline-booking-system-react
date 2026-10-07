import { APP_ROUTES } from '@/constants/routes';
import {
  ApiError,
  getErrorMessage,
  getErrorStatus,
  getErrorTitle,
} from '@/services/api';

export interface FeatureErrorPresentation {
  title: string;
  message: string;
  status?: number;
  /** Suggested hard-navigation target for authz failures. */
  navigateTo?: string;
}

/**
 * Feature-level helper: map any thrown value into safe UI copy + optional navigation.
 */
export function getFeatureErrorPresentation(
  error: unknown,
  fallbackMessage?: string,
): FeatureErrorPresentation {
  const status = getErrorStatus(error);
  const title = getErrorTitle(error);
  const message = getErrorMessage(error, fallbackMessage);

  let navigateTo: string | undefined;
  if (status === 401) {
    navigateTo = APP_ROUTES.public.unauthorized;
  } else if (status === 403) {
    navigateTo = APP_ROUTES.public.forbidden;
  }

  return { title, message, status, navigateTo };
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}
