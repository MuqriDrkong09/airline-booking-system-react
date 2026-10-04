import { useQuery } from '@tanstack/react-query';
import { adminDashboardKeys, fetchAdminDashboard } from '../api';

export function useAdminDashboardQuery(enabled = true) {
  return useQuery({
    queryKey: adminDashboardKeys.detail(),
    queryFn: fetchAdminDashboard,
    enabled,
  });
}
