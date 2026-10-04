import { env } from '@/config/env';
import type { AdminDashboardData } from '../types/dashboard';
import { createHttpAdminDashboardApi } from './httpAdminDashboardApi';
import { mockAdminDashboardApi } from './mockAdminDashboardApi';
import type { AdminDashboardApi } from './adminDashboardApi.types';

export const adminDashboardApi: AdminDashboardApi = env.useMockAuth
  ? mockAdminDashboardApi
  : createHttpAdminDashboardApi();

export const adminDashboardKeys = {
  all: ['admin-dashboard'] as const,
  detail: () => [...adminDashboardKeys.all, 'detail'] as const,
};

export function fetchAdminDashboard(): Promise<AdminDashboardData> {
  return adminDashboardApi.getDashboard();
}

export type { AdminDashboardApi } from './adminDashboardApi.types';
export { createHttpAdminDashboardApi } from './httpAdminDashboardApi';
export { createMockAdminDashboardApi, mockAdminDashboardApi } from './mockAdminDashboardApi';
export { createMockAdminDashboardData } from './dashboardData';
