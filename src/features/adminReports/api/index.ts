import { env } from '@/config/env';
import type { AdminReportsData, ReportFilters } from '../types/adminReport';
import type { AdminReportsApi } from './adminReportsApi.types';
import { createHttpAdminReportsApi } from './httpAdminReportsApi';
import { mockAdminReportsApi } from './mockAdminReportsApi';

export const adminReportsApi: AdminReportsApi = env.useMockAuth
  ? mockAdminReportsApi
  : createHttpAdminReportsApi();

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
