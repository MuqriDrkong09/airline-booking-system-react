import { createApiClient, DEFAULT_API_TIMEOUT_MS } from '@/services/api/createApiClient';

describe('createApiClient', () => {
  it('creates an axios instance with the provided base URL', () => {
    const client = createApiClient('https://api.example.com');

    expect(client.defaults.baseURL).toBe('https://api.example.com');
    expect(client.defaults.timeout).toBe(DEFAULT_API_TIMEOUT_MS);
  });

  it('allows overriding the timeout', () => {
    const client = createApiClient('https://api.example.com', { timeout: 5_000 });
    expect(client.defaults.timeout).toBe(5_000);
  });
});
