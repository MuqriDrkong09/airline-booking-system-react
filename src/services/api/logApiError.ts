import axios from 'axios';
import { env } from '@/config/env';
import { ApiError } from './errors';

export interface LogApiErrorContext {
  source?: string;
  url?: string;
  method?: string;
  [key: string]: unknown;
}

/**
 * Logs structured debugging details in development only.
 * Never use this output in the UI.
 */
export function logApiError(error: unknown, context: LogApiErrorContext = {}): void {
  if (!env.isDev) {
    return;
  }

  const payload: Record<string, unknown> = {
    ...context,
    name: error instanceof Error ? error.name : typeof error,
  };

  if (error instanceof ApiError) {
    payload.message = error.message;
    payload.status = error.status;
    payload.code = error.code;
    payload.fieldErrors = error.fieldErrors;
  } else if (axios.isAxiosError(error)) {
    payload.message = error.message;
    payload.status = error.response?.status;
    payload.url = error.config?.url ?? context.url;
    payload.method = error.config?.method ?? context.method;
    payload.responseData = error.response?.data;
    payload.code = error.code;
  } else if (error instanceof Error) {
    payload.message = error.message;
    payload.stack = error.stack;
  } else {
    payload.raw = error;
  }

  console.error('[ApiError]', payload);
}
