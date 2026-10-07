import { adminApi } from '@/services/adminApi';
import type { AdminDashboardData } from '../types/dashboard';
import type { AdminDashboardApi } from './adminDashboardApi.types';

export const adminDashboardApi: AdminDashboardApi = adminApi.dashboard;

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
