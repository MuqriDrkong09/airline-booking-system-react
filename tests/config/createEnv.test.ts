import { createEnv } from '@/config/createEnv';

describe('createEnv', () => {
  const baseSource = {
    DEV: false,
    PROD: true,
  };

  it('uses fallback values when env vars are missing', () => {
    const env = createEnv(baseSource);

    expect(env).toEqual({
      apiBaseUrl: 'http://localhost:3000/api',
      appName: 'AeroBook',
      useMockAuth: true,
      isDev: false,
      isProd: true,
    });
  });

  it('trims provided values and ignores blank strings', () => {
    const env = createEnv({
      ...baseSource,
      VITE_API_BASE_URL: '  https://api.example.com  ',
      VITE_APP_NAME: '   ',
      VITE_USE_MOCK_AUTH: 'false',
      DEV: true,
      PROD: false,
    });

    expect(env.apiBaseUrl).toBe('https://api.example.com');
    expect(env.appName).toBe('AeroBook');
    expect(env.useMockAuth).toBe(false);
    expect(env.isDev).toBe(true);
    expect(env.isProd).toBe(false);
  });
});
