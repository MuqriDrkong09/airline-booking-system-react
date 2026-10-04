import type { AxiosInstance } from 'axios';
import { apiClient } from '@/services/api/client';
import type { AdminDashboardData } from '../types/dashboard';
import type { AdminDashboardApi } from './adminDashboardApi.types';

export function createHttpAdminDashboardApi(
  client: AxiosInstance = apiClient,
): AdminDashboardApi {
  return {
    async getDashboard(): Promise<AdminDashboardData> {
      const { data } = await client.get<AdminDashboardData>('/admin/dashboard');
      return data;
    },
  };
}
