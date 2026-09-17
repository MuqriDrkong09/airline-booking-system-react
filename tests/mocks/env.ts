import type { AppEnv } from '@/config/createEnv';

export const env: AppEnv = {
  apiBaseUrl: 'http://localhost:3000/api',
  appName: 'AeroBook',
  useMockAuth: true,
  isDev: true,
  isProd: false,
};
