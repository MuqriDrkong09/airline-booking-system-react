import type { InternalAxiosRequestConfig } from 'axios';
import { apiClient } from '@/services/api/client';
import type { TokenStorage } from './tokenStorage';
import { tokenStorage } from './tokenStorage';

let interceptorsAttached = false;

export function attachAuthInterceptors(
  client = apiClient,
  storage: TokenStorage = tokenStorage,
): void {
  if (interceptorsAttached) {
    return;
  }

  client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = storage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  interceptorsAttached = true;
}
