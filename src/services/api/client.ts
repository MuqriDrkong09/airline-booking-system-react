import { env } from '@/config/env';
import { createApiClient } from './createApiClient';

export const apiClient = createApiClient(env.apiBaseUrl);
