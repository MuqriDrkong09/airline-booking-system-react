/** User-facing copy for common HTTP / transport failures. Never include stack traces. */

export const NETWORK_ERROR_MESSAGE =
  'Unable to connect. Check your internet connection and try again.';

export const TIMEOUT_ERROR_MESSAGE =
  'The request took too long. Please try again in a moment.';

export const DEFAULT_ERROR_MESSAGE = 'Something went wrong. Please try again.';

export const UNEXPECTED_ERROR_MESSAGE =
  'An unexpected error occurred. Please try again.';

/** Status → friendly body copy shown in UI. */
export const HTTP_STATUS_MESSAGES: Record<number, string> = {
  401: 'Your session has expired or you are not signed in. Please sign in again.',
  403: 'You do not have permission to perform this action.',
  404: 'The requested resource could not be found.',
  409: 'This action conflicts with the current state. Please refresh and try again.',
  422: 'Some of the information provided is invalid. Please check and try again.',
  429: 'Too many requests. Please wait a moment and try again.',
  500: 'A server error occurred. Please try again later.',
  502: 'The service is temporarily unavailable. Please try again later.',
  503: 'The service is temporarily unavailable. Please try again later.',
  504: 'The service is temporarily unavailable. Please try again later.',
};

/** Status → short title for ErrorState headings. */
export const HTTP_STATUS_TITLES: Record<number, string> = {
  401: 'Sign in required',
  403: 'Access denied',
  404: 'Not found',
  409: 'Conflict',
  422: 'Invalid request',
  429: 'Too many requests',
  500: 'Server error',
  502: 'Service unavailable',
  503: 'Service unavailable',
  504: 'Service unavailable',
};

const TECHNICAL_MESSAGE_PATTERNS: readonly RegExp[] = [
  /^network error$/i,
  /timeout/i,
  /econnaborted/i,
  /enotfound/i,
  /^request failed$/i,
  /request failed with status code/i,
  /\bat\s+\S+\s+\(/,
  /\n\s+at\s+/,
  /axioserror/i,
  /^error:\s/i,
];

export function isTechnicalErrorMessage(message: string): boolean {
  const trimmed = message.trim();
  if (!trimmed) {
    return true;
  }
  return TECHNICAL_MESSAGE_PATTERNS.some((pattern) => pattern.test(trimmed));
}

export function messageForHttpStatus(status?: number): string | undefined {
  if (status == null) {
    return undefined;
  }
  if (HTTP_STATUS_MESSAGES[status]) {
    return HTTP_STATUS_MESSAGES[status];
  }
  if (status >= 500) {
    return HTTP_STATUS_MESSAGES[500];
  }
  return undefined;
}

export function titleForHttpStatus(status?: number): string {
  if (status != null && HTTP_STATUS_TITLES[status]) {
    return HTTP_STATUS_TITLES[status];
  }
  if (status != null && status >= 500) {
    return HTTP_STATUS_TITLES[500]!;
  }
  if (status == null) {
    return 'Connection problem';
  }
  return 'Something went wrong';
}
