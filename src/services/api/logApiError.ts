import axios from 'axios';
import { env } from '@/config/env';
import { ApiError } from './errors';

export interface LogApiErrorContext {
  source?: string;
  url?: string;
  method?: string;
  [key: string]: unknown;
}

const SENSITIVE_KEY_PATTERN =
  /pass(word)?|secret|token|authorization|cvv|cvc|pan|cardNumber|card_number|refresh/i;

function redactSensitive(value: unknown, depth = 0): unknown {
  if (depth > 4 || value == null) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => redactSensitive(item, depth + 1));
  }

  if (typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      result[key] = SENSITIVE_KEY_PATTERN.test(key)
        ? '[REDACTED]'
        : redactSensitive(nested, depth + 1);
    }
    return result;
  }

  return value;
}

/**
 * Logs structured debugging details in development only.
 * Never use this output in the UI. Sensitive fields are redacted.
 */
export function logApiError(error: unknown, context: LogApiErrorContext = {}): void {
  if (!env.isDev) {
    return;
  }

  const payload: Record<string, unknown> = {
    ...(redactSensitive(context) as Record<string, unknown>),
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
    payload.responseData = redactSensitive(error.response?.data);
    payload.code = error.code;
  } else if (error instanceof Error) {
    payload.message = error.message;
    payload.stack = error.stack;
  } else {
    payload.raw = redactSensitive(error);
  }

  console.error('[ApiError]', payload);
}
