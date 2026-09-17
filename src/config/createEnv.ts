export interface EnvSource {
  VITE_API_BASE_URL?: string;
  VITE_APP_NAME?: string;
  VITE_USE_MOCK_AUTH?: string;
  DEV: boolean;
  PROD: boolean;
}

export interface AppEnv {
  apiBaseUrl: string;
  appName: string;
  useMockAuth: boolean;
  isDev: boolean;
  isProd: boolean;
}

const DEFAULT_API_BASE_URL = 'http://localhost:3000/api';
const DEFAULT_APP_NAME = 'AeroBook';

function readOptionalString(value: string | undefined, fallback: string): string {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : fallback;
}

function readBooleanFlag(value: string | undefined, fallback: boolean): boolean {
  if (value == null || value.trim() === '') {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === 'true' || normalized === '1') {
    return true;
  }
  if (normalized === 'false' || normalized === '0') {
    return false;
  }

  return fallback;
}

export function createEnv(source: EnvSource): AppEnv {
  return {
    apiBaseUrl: readOptionalString(source.VITE_API_BASE_URL, DEFAULT_API_BASE_URL),
    appName: readOptionalString(source.VITE_APP_NAME, DEFAULT_APP_NAME),
    useMockAuth: readBooleanFlag(source.VITE_USE_MOCK_AUTH, true),
    isDev: source.DEV,
    isProd: source.PROD,
  };
}
