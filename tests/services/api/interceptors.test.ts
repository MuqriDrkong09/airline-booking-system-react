import type { AxiosInstance } from 'axios';
import axios from 'axios';
import {
  createApiClient,
  resetApiInterceptorsForTests,
  setupApiInterceptors,
} from '@/services/api';
import { createMemoryTokenStorage } from '@/services/auth';

describe('api interceptors', () => {
  let client: AxiosInstance;

  beforeEach(() => {
    resetApiInterceptorsForTests();
    client = createApiClient('https://api.example.com');
    jest.spyOn(client, 'request');
  });

  afterEach(() => {
    jest.restoreAllMocks();
    resetApiInterceptorsForTests();
  });

  it('attaches the bearer token from storage', async () => {
    const storage = createMemoryTokenStorage();
    storage.setAccessToken('access-token');
    setupApiInterceptors(client, { storage, disableUnauthorizedRedirect: true });

    const adapter = jest.fn(async (config) => ({
      data: { ok: true },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    }));
    client.defaults.adapter = adapter;

    await client.get('/flights');

    expect(adapter).toHaveBeenCalled();
    const config = adapter.mock.calls[0]?.[0] as { headers: { Authorization?: string } };
    expect(config.headers.Authorization).toBe('Bearer access-token');
  });

  it('retries idempotent GET requests on retryable status codes', async () => {
    setupApiInterceptors(client, {
      getAccessToken: () => null,
      maxRetries: 2,
      disableUnauthorizedRedirect: true,
    });

    let attempts = 0;
    client.defaults.adapter = jest.fn(async (config) => {
      attempts += 1;
      if (attempts < 3) {
        throw new axios.AxiosError(
          'Service unavailable',
          'ERR_BAD_RESPONSE',
          config,
          undefined,
          {
            status: 503,
            statusText: 'Service Unavailable',
            headers: {},
            config,
            data: {},
          },
        );
      }
      return {
        data: { ok: true },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      };
    });

    const response = await client.get('/flights/search');
    expect(response.data).toEqual({ ok: true });
    expect(attempts).toBe(3);
  });

  it('does not retry non-idempotent POST requests', async () => {
    setupApiInterceptors(client, {
      getAccessToken: () => null,
      maxRetries: 2,
      disableUnauthorizedRedirect: true,
    });

    let attempts = 0;
    client.defaults.adapter = jest.fn(async (config) => {
      attempts += 1;
      throw new axios.AxiosError('Service unavailable', 'ERR_BAD_RESPONSE', config, undefined, {
        status: 503,
        statusText: 'Service Unavailable',
        headers: {},
        config,
        data: {},
      });
    });

    await expect(client.post('/auth/login', {})).rejects.toBeTruthy();
    expect(attempts).toBe(1);
  });
});
