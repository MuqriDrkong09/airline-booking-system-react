export interface TokenStorage {
  getAccessToken: () => string | null;
  setAccessToken: (token: string) => void;
  getRefreshToken: () => string | null;
  setRefreshToken: (token: string) => void;
  clear: () => void;
}

const ACCESS_TOKEN_KEY = 'aerobook.accessToken';
const REFRESH_TOKEN_KEY = 'aerobook.refreshToken';

export function createMemoryTokenStorage(): TokenStorage {
  let accessToken: string | null = null;
  let refreshToken: string | null = null;

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
  };
}

export function createLocalTokenStorage(
  storage: Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> = localStorage,
): TokenStorage {
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

export const tokenStorage: TokenStorage =
  typeof window === 'undefined' ? createMemoryTokenStorage() : createLocalTokenStorage();
