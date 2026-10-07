import axios from 'axios';
import {
  DEFAULT_ERROR_MESSAGE,
  HTTP_STATUS_MESSAGES,
  NETWORK_ERROR_MESSAGE,
  TIMEOUT_ERROR_MESSAGE,
  isTechnicalErrorMessage,
  messageForHttpStatus,
  titleForHttpStatus,
} from './httpErrorMessages';

export interface ApiErrorBody {
  message?: string;
  code?: string;
  fieldErrors?: Record<string, string[]>;
}

export class ApiError extends Error {
  readonly status?: number;
  readonly code?: string;
  readonly fieldErrors?: Record<string, string[]>;

  constructor(
    message: string,
    options?: { status?: number; code?: string; fieldErrors?: Record<string, string[]> },
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = options?.status;
    this.code = options?.code;
    this.fieldErrors = options?.fieldErrors;
  }
}

/** Auth-domain alias kept for existing callers and mock auth. */
export class AuthApiError extends ApiError {
  constructor(
    message: string,
    options?: { status?: number; code?: string; fieldErrors?: Record<string, string[]> },
  ) {
    super(message, options);
    this.name = 'AuthApiError';
  }
}

function firstFieldErrorMessage(
  fieldErrors?: Record<string, string[]>,
): string | undefined {
  if (!fieldErrors) {
    return undefined;
  }
  for (const messages of Object.values(fieldErrors)) {
    const first = messages.find((item) => item.trim());
    if (first) {
      return first;
    }
  }
  return undefined;
}

function extractRawMessage(error: unknown): string | undefined {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiErrorBody | string | undefined;

    if (typeof data === 'string' && data.trim()) {
      return data.trim();
    }

    if (data && typeof data === 'object') {
      if (typeof data.message === 'string' && data.message.trim()) {
        return data.message.trim();
      }
      const fieldMessage = firstFieldErrorMessage(data.fieldErrors);
      if (fieldMessage) {
        return fieldMessage;
      }
    }

    if (error.message?.trim()) {
      return error.message.trim();
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message.trim();
  }

  return undefined;
}

export function getErrorStatus(error: unknown): number | undefined {
  if (error instanceof ApiError) {
    return error.status;
  }
  if (axios.isAxiosError(error)) {
    return error.response?.status;
  }
  return undefined;
}

export function isNetworkError(error: unknown): boolean {
  if (axios.isAxiosError(error)) {
    return !error.response;
  }
  if (error instanceof ApiError) {
    return error.status == null && /connect|network|internet/i.test(error.message);
  }
  return false;
}

/**
 * User-facing error copy. Never returns stack traces or raw Axios internals.
 * Prefer backend `message` when it looks safe; otherwise map by HTTP status.
 */
export function getErrorMessage(
  error: unknown,
  fallback = DEFAULT_ERROR_MESSAGE,
): string {
  const status = getErrorStatus(error);
  const raw = extractRawMessage(error);

  if (axios.isAxiosError(error) && !error.response) {
    if (error.code === 'ECONNABORTED' || /timeout/i.test(error.message)) {
      return TIMEOUT_ERROR_MESSAGE;
    }
    return NETWORK_ERROR_MESSAGE;
  }

  if (raw && !isTechnicalErrorMessage(raw)) {
    return raw;
  }

  if (status === 422) {
    const fieldMessage =
      error instanceof ApiError
        ? firstFieldErrorMessage(error.fieldErrors)
        : axios.isAxiosError(error)
          ? firstFieldErrorMessage(
              (error.response?.data as ApiErrorBody | undefined)?.fieldErrors,
            )
          : undefined;
    if (fieldMessage && !isTechnicalErrorMessage(fieldMessage)) {
      return fieldMessage;
    }
  }

  return messageForHttpStatus(status) ?? fallback;
}

export function getErrorTitle(error: unknown, fallback = 'Something went wrong'): string {
  if (axios.isAxiosError(error) && !error.response) {
    return 'Connection problem';
  }
  const status = getErrorStatus(error);
  if (status == null && !(error instanceof ApiError)) {
    return fallback;
  }
  return titleForHttpStatus(status);
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiErrorBody | undefined;
    return new ApiError(getErrorMessage(error), {
      status: error.response?.status,
      code: data?.code,
      fieldErrors: data?.fieldErrors,
    });
  }

  return new ApiError(getErrorMessage(error));
}

export function toAuthApiError(error: unknown): AuthApiError {
  if (error instanceof AuthApiError) {
    return error;
  }

  const apiError = toApiError(error);
  return new AuthApiError(apiError.message, {
    status: apiError.status,
    code: apiError.code,
    fieldErrors: apiError.fieldErrors,
  });
}

export {
  DEFAULT_ERROR_MESSAGE,
  HTTP_STATUS_MESSAGES,
  HTTP_STATUS_TITLES,
  NETWORK_ERROR_MESSAGE,
  TIMEOUT_ERROR_MESSAGE,
  UNEXPECTED_ERROR_MESSAGE,
} from './httpErrorMessages';
