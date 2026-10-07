import axios from 'axios';
import type { AxiosInstance } from 'axios';

export const DEFAULT_API_TIMEOUT_MS = 15_000;

export interface CreateApiClientOptions {
  /** Request timeout in milliseconds. */
  timeout?: number;
}

export function createApiClient(
  baseURL: string,
  options: CreateApiClientOptions = {},
): AxiosInstance {
  return axios.create({
    baseURL,
    timeout: options.timeout ?? DEFAULT_API_TIMEOUT_MS,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
}
