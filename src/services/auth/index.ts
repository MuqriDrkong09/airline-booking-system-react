import { apiClient } from '@/services/api/client';
import { env } from '@/config/env';
import type { AuthApi } from './authApi.types';
import { attachAuthInterceptors } from './authInterceptors';
import { createHttpAuthApi } from './httpAuthApi';
import { createMockAuthApiWithSessionLookup } from './mockAuthApi';
import { tokenStorage } from './tokenStorage';

attachAuthInterceptors(apiClient, tokenStorage);

export const authApi: AuthApi = env.useMockAuth
  ? createMockAuthApiWithSessionLookup(() => tokenStorage.getAccessToken())
  : createHttpAuthApi(apiClient);

export type { AuthApi } from './authApi.types';
export { AuthApiError, getErrorMessage, toAuthApiError } from './errors';
export {
  tokenStorage,
  createLocalTokenStorage,
  createMemoryTokenStorage,
  createBrowserTokenStorage,
} from './tokenStorage';
export type { TokenStorage } from './tokenStorage';
