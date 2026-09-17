import axios from 'axios';
import type { AuthApiErrorBody } from '@/types/auth';

export class AuthApiError extends Error {
  readonly status?: number;
  readonly code?: string;
  readonly fieldErrors?: Record<string, string[]>;

  constructor(message: string, options?: { status?: number; code?: string; fieldErrors?: Record<string, string[]> }) {
    super(message);
    this.name = 'AuthApiError';
    this.status = options?.status;
    this.code = options?.code;
    this.fieldErrors = options?.fieldErrors;
  }
}

export function getErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (error instanceof AuthApiError) {
    return error.message;
  }

  if (axios.isAxiosError(error)) {
    const data = error.response?.data as AuthApiErrorBody | string | undefined;

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

export function toAuthApiError(error: unknown): AuthApiError {
  if (error instanceof AuthApiError) {
    return error;
  }

  if (axios.isAxiosError(error)) {
    const data = error.response?.data as AuthApiErrorBody | undefined;
    return new AuthApiError(getErrorMessage(error), {
      status: error.response?.status,
      code: data?.code,
      fieldErrors: data?.fieldErrors,
    });
  }

  return new AuthApiError(getErrorMessage(error));
}
