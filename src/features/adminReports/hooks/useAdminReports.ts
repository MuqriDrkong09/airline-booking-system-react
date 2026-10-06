import { useQuery } from '@tanstack/react-query';
import { adminReportKeys, fetchAdminReports } from '../api';
import type { ReportFilters } from '../types/adminReport';
import { isCustomRangeReady } from '../utils/reportDateRange';

export function useAdminReportsQuery(filters: ReportFilters, enabled = true) {
  return useQuery({
    queryKey: adminReportKeys.detail(filters),
    queryFn: () => fetchAdminReports(filters),
    enabled: enabled && isCustomRangeReady(filters),
    placeholderData: (previous) => previous,
  });
}
