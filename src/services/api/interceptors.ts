import type {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import type { TokenStorage } from '@/services/auth/tokenStorage';
import { tokenStorage } from '@/services/auth/tokenStorage';
import { API_ENDPOINTS } from './endpoints';
import { logApiError } from './logApiError';
import { handleUnauthorizedSession } from './unauthorizedHandler';

export const DEFAULT_RETRY_COUNT = 2;
export const RETRYABLE_STATUS_CODES = new Set([408, 429, 500, 502, 503, 504]);

const IDEMPOTENT_METHODS = new Set(['get', 'head', 'options']);

type AccessTokenReader = () => string | null;

/** Extended Axios config used by auth + retry interceptors. */
export type ApiRequestConfig = InternalAxiosRequestConfig & {
  skipAuth?: boolean;
  skipRetry?: boolean;
  __retryCount?: number;
};

let interceptorsAttached = false;

function asApiConfig(
  config?: InternalAxiosRequestConfig | null,
): ApiRequestConfig | undefined {
  return config as ApiRequestConfig | undefined;
}

function isAuthCredentialRequest(url?: string): boolean {
  if (!url) {
    return false;
  }
  const authPaths = [
    API_ENDPOINTS.auth.login,
    API_ENDPOINTS.auth.register,
    API_ENDPOINTS.auth.forgotPassword,
    API_ENDPOINTS.auth.resetPassword,
    API_ENDPOINTS.auth.verifyEmail,
  ];
  return authPaths.some((path) => url.includes(path));
}

function shouldRetryRequest(error: AxiosError): boolean {
  const config = asApiConfig(error.config);
  if (!config || config.skipRetry) {
    return false;
  }

  const method = (config.method ?? 'get').toLowerCase();
  if (!IDEMPOTENT_METHODS.has(method)) {
    return false;
  }

  const retryCount = config.__retryCount ?? 0;
  if (retryCount >= DEFAULT_RETRY_COUNT) {
    return false;
  }

  // Network / timeout errors have no response.
  if (!error.response) {
    return true;
  }

  return RETRYABLE_STATUS_CODES.has(error.response.status);
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export interface SetupApiInterceptorsOptions {
  storage?: TokenStorage;
  getAccessToken?: AccessTokenReader;
  /** Max retries for idempotent requests (default {@link DEFAULT_RETRY_COUNT}). */
  maxRetries?: number;
  /** Disable 401 session clear + redirect (useful in unit tests). */
  disableUnauthorizedRedirect?: boolean;
}

/**
 * Attaches request (auth) and response (retry) interceptors once per process.
 * Call from the shared API client bootstrap — not from UI components.
 */
export function setupApiInterceptors(
  client: AxiosInstance,
  options: SetupApiInterceptorsOptions = {},
): void {
  if (interceptorsAttached) {
    return;
  }

  const storage = options.storage ?? tokenStorage;
  const getAccessToken = options.getAccessToken ?? (() => storage.getAccessToken());
  const maxRetries = options.maxRetries ?? DEFAULT_RETRY_COUNT;
  const disableUnauthorizedRedirect = options.disableUnauthorizedRedirect ?? false;

  client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const apiConfig = config as ApiRequestConfig;
    if (!apiConfig.skipAuth) {
      const token = getAccessToken();
      if (token) {
        apiConfig.headers.Authorization = `Bearer ${token}`;
      }
    }
    return apiConfig;
  });

  client.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
      const config = asApiConfig(error.config);
      if (!config) {
        logApiError(error, { source: 'api.interceptor' });
        return Promise.reject(error);
      }

      if (shouldRetryRequest(error) && (config.__retryCount ?? 0) < maxRetries) {
        config.__retryCount = (config.__retryCount ?? 0) + 1;
        const backoffMs = 300 * 2 ** (config.__retryCount - 1);
        await delay(backoffMs);
        return client.request(config);
      }

      logApiError(error, {
        source: 'api.interceptor',
        url: config.url,
        method: config.method,
        status: error.response?.status,
      });

      // Login/register credential failures stay on the form — do not bounce the page.
      if (error.response?.status === 401 && isAuthCredentialRequest(config.url)) {
        return Promise.reject(error);
      }

      if (error.response?.status === 401 && !disableUnauthorizedRedirect) {
        handleUnauthorizedSession({ storage });
      }

      return Promise.reject(error);
    },
  );

  interceptorsAttached = true;
}

/** @deprecated Use {@link setupApiInterceptors}. */
export function attachAuthInterceptors(
  client: AxiosInstance,
  storage: TokenStorage = tokenStorage,
): void {
  setupApiInterceptors(client, { storage });
}

/** Test helper — resets the one-time attach guard. */
export function resetApiInterceptorsForTests(): void {
  interceptorsAttached = false;
}
