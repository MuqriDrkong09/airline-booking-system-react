import { apiClient } from '@/services/api/client';
import { env } from '@/config/env';
import type { AuthApi } from './authApi.types';
import { createHttpAuthApi } from './httpAuthApi';
import { createMockAuthApiWithSessionLookup } from './mockAuthApi';
import { tokenStorage } from './tokenStorage';

// Interceptors are attached when `@/services/api/client` loads.

export const authApi: AuthApi = env.useMockAuth
  ? createMockAuthApiWithSessionLookup(() => tokenStorage.getAccessToken())
  : createHttpAuthApi(apiClient);

export type { AuthApi } from './authApi.types';
export {
  ApiError,
  AuthApiError,
  getErrorMessage,
  toApiError,
  toAuthApiError,
} from './errors';
export {
  tokenStorage,
  createLocalTokenStorage,
  createMemoryTokenStorage,
  createBrowserTokenStorage,
} from './tokenStorage';
export type { TokenStorage } from './tokenStorage';
export { attachAuthInterceptors } from './authInterceptors';
