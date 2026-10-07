import { env } from '@/config/env';
import { createApiClient } from './createApiClient';
import { setupApiInterceptors } from './interceptors';

/**
 * Shared Axios instance for all domain API services.
 * Base URL comes from `VITE_API_BASE_URL`. Interceptors handle auth + retry.
 */
export const apiClient = createApiClient(env.apiBaseUrl);

setupApiInterceptors(apiClient);
