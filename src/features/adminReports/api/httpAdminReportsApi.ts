import type { AxiosInstance } from 'axios';
import { apiClient } from '@/services/api/client';
import type { AdminReportsData, ReportFilters } from '../types/adminReport';
import { resolveReportRange } from '../utils/reportDateRange';
import type { AdminReportsApi } from './adminReportsApi.types';

export function createHttpAdminReportsApi(client: AxiosInstance = apiClient): AdminReportsApi {
  return {
    async getReports(filters: ReportFilters): Promise<AdminReportsData> {
      const range = resolveReportRange(filters);
      const { data } = await client.get<AdminReportsData>('/admin/reports', {
        params: {
          preset: range.preset,
          startDate: range.startDate,
          endDate: range.endDate,
        },
      });
      return data;
    },
  };
}
