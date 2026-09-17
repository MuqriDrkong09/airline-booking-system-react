export interface TokenStorage {
  getAccessToken: () => string | null;
  setAccessToken: (token: string) => void;
  getRefreshToken: () => string | null;
  setRefreshToken: (token: string) => void;
  clear: () => void;
  /** When supported, controls whether tokens survive browser restarts. */
  setRememberSession?: (remember: boolean) => void;
  getRememberSession?: () => boolean;
}

const ACCESS_TOKEN_KEY = 'aerobook.accessToken';
const REFRESH_TOKEN_KEY = 'aerobook.refreshToken';
const REMEMBER_SESSION_KEY = 'aerobook.rememberSession';

type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export function createMemoryTokenStorage(): TokenStorage {
  let accessToken: string | null = null;
  let refreshToken: string | null = null;
  let rememberSession = true;

  return {
    getAccessToken: () => accessToken,
    setAccessToken: (token) => {
      accessToken = token;
    },
    getRefreshToken: () => refreshToken,
    setRefreshToken: (token) => {
      refreshToken = token;
    },
    clear: () => {
      accessToken = null;
      refreshToken = null;
    },
    setRememberSession: (remember) => {
      rememberSession = remember;
    },
    getRememberSession: () => rememberSession,
  };
}

export function createLocalTokenStorage(storage: StorageLike = localStorage): TokenStorage {
  return {
    getAccessToken: () => storage.getItem(ACCESS_TOKEN_KEY),
    setAccessToken: (token) => {
      storage.setItem(ACCESS_TOKEN_KEY, token);
    },
    getRefreshToken: () => storage.getItem(REFRESH_TOKEN_KEY),
    setRefreshToken: (token) => {
      storage.setItem(REFRESH_TOKEN_KEY, token);
    },
    clear: () => {
      storage.removeItem(ACCESS_TOKEN_KEY);
      storage.removeItem(REFRESH_TOKEN_KEY);
    },
  };
}

function readRememberPreference(persistent: StorageLike): boolean {
  return persistent.getItem(REMEMBER_SESSION_KEY) !== 'false';
}

function createDualTokenStorage(persistent: StorageLike, session: StorageLike): TokenStorage {
  const clearBucket = (bucket: StorageLike) => {
    bucket.removeItem(ACCESS_TOKEN_KEY);
    bucket.removeItem(REFRESH_TOKEN_KEY);
  };

  const activeBucket = (): StorageLike =>
    readRememberPreference(persistent) ? persistent : session;

  const readToken = (key: string): string | null =>
    session.getItem(key) ?? persistent.getItem(key);

  return {
    getAccessToken: () => readToken(ACCESS_TOKEN_KEY),
    setAccessToken: (token) => {
      const bucket = activeBucket();
      const other = bucket === persistent ? session : persistent;
      clearBucket(other);
      bucket.setItem(ACCESS_TOKEN_KEY, token);
    },
    getRefreshToken: () => readToken(REFRESH_TOKEN_KEY),
    setRefreshToken: (token) => {
      const bucket = activeBucket();
      const other = bucket === persistent ? session : persistent;
      // Keep access token move consistent when setting refresh alone.
      const access = readToken(ACCESS_TOKEN_KEY);
      clearBucket(other);
      if (access) {
        bucket.setItem(ACCESS_TOKEN_KEY, access);
      }
      bucket.setItem(REFRESH_TOKEN_KEY, token);
    },
    clear: () => {
      clearBucket(persistent);
      clearBucket(session);
    },
    setRememberSession: (remember) => {
      persistent.setItem(REMEMBER_SESSION_KEY, remember ? 'true' : 'false');
      const access = readToken(ACCESS_TOKEN_KEY);
      const refresh = readToken(REFRESH_TOKEN_KEY);
      clearBucket(persistent);
      clearBucket(session);
      const bucket = remember ? persistent : session;
      if (access) {
        bucket.setItem(ACCESS_TOKEN_KEY, access);
      }
      if (refresh) {
        bucket.setItem(REFRESH_TOKEN_KEY, refresh);
      }
      persistent.setItem(REMEMBER_SESSION_KEY, remember ? 'true' : 'false');
    },
    getRememberSession: () => readRememberPreference(persistent),
  };
}

export function createBrowserTokenStorage(
  persistent: StorageLike = localStorage,
  session: StorageLike = sessionStorage,
): TokenStorage {
  return createDualTokenStorage(persistent, session);
}

export const tokenStorage: TokenStorage =
  typeof window === 'undefined'
    ? createMemoryTokenStorage()
    : createBrowserTokenStorage();
