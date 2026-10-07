import type { AxiosInstance } from 'axios';
import { API_ENDPOINTS, apiClient } from '@/services/api';
import type { AdminDashboardData } from '../types/dashboard';
import type { AdminDashboardApi } from './adminDashboardApi.types';

export function createHttpAdminDashboardApi(
  client: AxiosInstance = apiClient,
): AdminDashboardApi {
  return {
    async getDashboard(): Promise<AdminDashboardData> {
      const { data } = await client.get<AdminDashboardData>(API_ENDPOINTS.admin.dashboard);
      return data;
    },
  };
}
