import { createApiClient } from '@/services/api/createApiClient';

describe('createApiClient', () => {
  it('creates an axios instance with the provided base URL', () => {
    const client = createApiClient('https://api.example.com');

    expect(client.defaults.baseURL).toBe('https://api.example.com');
    expect(client.defaults.timeout).toBe(15_000);
  });
});
