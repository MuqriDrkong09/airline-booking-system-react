import {
  createBrowserTokenStorage,
  createLocalTokenStorage,
  createMemoryTokenStorage,
} from '@/services/auth';

function createMapStorage() {
  const backing = new Map<string, string>();
  return {
    backing,
    storage: {
      getItem: (key: string) => backing.get(key) ?? null,
      setItem: (key: string, value: string) => {
        backing.set(key, value);
      },
      removeItem: (key: string) => {
        backing.delete(key);
      },
    },
  };
}

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
    const { backing, storage: backend } = createMapStorage();
    const storage = createLocalTokenStorage(backend);

    storage.setAccessToken('jwt-access');
    storage.setRefreshToken('jwt-refresh');

    expect(storage.getAccessToken()).toBe('jwt-access');
    expect(storage.getRefreshToken()).toBe('jwt-refresh');

    storage.clear();
    expect(backing.size).toBe(0);
  });

  it('stores remembered sessions in persistent storage', () => {
    const persistent = createMapStorage();
    const session = createMapStorage();
    const storage = createBrowserTokenStorage(persistent.storage, session.storage);

    storage.setRememberSession?.(true);
    storage.setAccessToken('access');
    storage.setRefreshToken('refresh');

    expect(persistent.backing.get('aerobook.accessToken')).toBe('access');
    expect(session.backing.get('aerobook.accessToken')).toBeUndefined();
    expect(storage.getRememberSession?.()).toBe(true);
  });

  it('stores non-remembered sessions in session storage only', () => {
    const persistent = createMapStorage();
    const session = createMapStorage();
    const storage = createBrowserTokenStorage(persistent.storage, session.storage);

    storage.setRememberSession?.(false);
    storage.setAccessToken('access');
    storage.setRefreshToken('refresh');

    expect(session.backing.get('aerobook.accessToken')).toBe('access');
    expect(persistent.backing.get('aerobook.accessToken')).toBeUndefined();
    expect(storage.getRememberSession?.()).toBe(false);
  });
});
