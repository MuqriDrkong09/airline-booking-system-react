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

  it('applies custom app name and api base url when provided', () => {
    const env = createEnv({
      ...baseSource,
      VITE_API_BASE_URL: 'https://prod.example.com/api',
      VITE_APP_NAME: 'AeroBook Cloud',
    });

    expect(env.apiBaseUrl).toBe('https://prod.example.com/api');
    expect(env.appName).toBe('AeroBook Cloud');
  });

  it('treats true and 1 as enabled mock-auth flags', () => {
    expect(
      createEnv({
        ...baseSource,
        VITE_USE_MOCK_AUTH: 'true',
      }).useMockAuth,
    ).toBe(true);

    expect(
      createEnv({
        ...baseSource,
        VITE_USE_MOCK_AUTH: ' 1 ',
      }).useMockAuth,
    ).toBe(true);
  });

  it('treats false and 0 as disabled mock-auth flags', () => {
    expect(
      createEnv({
        ...baseSource,
        VITE_USE_MOCK_AUTH: 'FALSE',
      }).useMockAuth,
    ).toBe(false);

    expect(
      createEnv({
        ...baseSource,
        VITE_USE_MOCK_AUTH: '0',
      }).useMockAuth,
    ).toBe(false);
  });

  it('falls back for blank or unrecognized mock-auth flags', () => {
    expect(
      createEnv({
        ...baseSource,
        VITE_USE_MOCK_AUTH: '   ',
      }).useMockAuth,
    ).toBe(true);

    expect(
      createEnv({
        ...baseSource,
        VITE_USE_MOCK_AUTH: 'maybe',
      }).useMockAuth,
    ).toBe(true);
  });
});
