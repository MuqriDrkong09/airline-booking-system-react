import { adminApi } from '@/services/adminApi';
import type { AdminReportsData, ReportFilters } from '../types/adminReport';
import type { AdminReportsApi } from './adminReportsApi.types';

export const adminReportsApi: AdminReportsApi = adminApi.reports;

export const adminReportKeys = {
  all: ['admin-reports'] as const,
  detail: (filters: ReportFilters) => [...adminReportKeys.all, 'detail', filters] as const,
};

export function fetchAdminReports(filters: ReportFilters): Promise<AdminReportsData> {
  return adminReportsApi.getReports(filters);
}

export type { AdminReportsApi } from './adminReportsApi.types';
export { createHttpAdminReportsApi } from './httpAdminReportsApi';
export { createMockAdminReportsApi, mockAdminReportsApi } from './mockAdminReportsApi';
export { createMockAdminReportsData } from './adminReportsData';
