import { createLocalTokenStorage, createMemoryTokenStorage } from '@/services/auth';

describe('tokenStorage', () => {
  it('stores and clears tokens in memory', () => {
    const storage = createMemoryTokenStorage();

    storage.setAccessToken('access');
    storage.setRefreshToken('refresh');

    expect(storage.getAccessToken()).toBe('access');
    expect(storage.getRefreshToken()).toBe('refresh');

    storage.clear();

    expect(storage.getAccessToken()).toBeNull();
    expect(storage.getRefreshToken()).toBeNull();
  });

  it('persists tokens through a Storage-like backend', () => {
    const backing = new Map<string, string>();
    const storage = createLocalTokenStorage({
      getItem: (key) => backing.get(key) ?? null,
      setItem: (key, value) => {
        backing.set(key, value);
      },
      removeItem: (key) => {
        backing.delete(key);
      },
    });

    storage.setAccessToken('jwt-access');
    storage.setRefreshToken('jwt-refresh');

    expect(storage.getAccessToken()).toBe('jwt-access');
    expect(storage.getRefreshToken()).toBe('jwt-refresh');

    storage.clear();
    expect(backing.size).toBe(0);
  });
});
