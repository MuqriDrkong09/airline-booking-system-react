/**
 * Domain service: authentication.
 * Components/hooks must use this layer (or `@/services/auth`) — never Axios directly.
 */
export {
  authApi,
  AuthApiError,
  ApiError,
  getErrorMessage,
  toApiError,
  toAuthApiError,
  tokenStorage,
  createBrowserTokenStorage,
  createLocalTokenStorage,
  createMemoryTokenStorage,
  attachAuthInterceptors,
} from '@/services/auth';
export type { AuthApi, TokenStorage } from '@/services/auth';
