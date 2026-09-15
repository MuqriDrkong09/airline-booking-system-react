import axios from 'axios';
import type { AxiosInstance } from 'axios';

export function createApiClient(baseURL: string): AxiosInstance {
  return axios.create({
    baseURL,
    timeout: 15_000,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });
}
