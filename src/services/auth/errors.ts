/**
 * Auth error helpers live in the shared API layer.
 * Re-exported here for backward-compatible `@/services/auth` imports.
 */
export {
  ApiError,
  AuthApiError,
  getErrorMessage,
  getErrorStatus,
  getErrorTitle,
  toApiError,
  toAuthApiError,
} from '@/services/api/errors';
export type { ApiErrorBody } from '@/services/api/errors';
