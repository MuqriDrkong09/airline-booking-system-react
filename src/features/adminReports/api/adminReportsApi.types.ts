import type { AdminReportsData, ReportFilters } from '../types/adminReport';

export interface AdminReportsApi {
  getReports: (filters: ReportFilters) => Promise<AdminReportsData>;
}
