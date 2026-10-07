import axios from 'axios';

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

export function getErrorMessage(
  error: unknown,
  fallback = 'Something went wrong. Please try again.',
): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiErrorBody | string | undefined;

    if (typeof data === 'string' && data.trim()) {
      return data;
    }

    if (data && typeof data === 'object' && typeof data.message === 'string' && data.message.trim()) {
      return data.message;
    }

    if (error.message) {
      return error.message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
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
