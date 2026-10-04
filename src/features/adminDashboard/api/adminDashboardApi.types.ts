import type { AdminDashboardData } from '../types/dashboard';

export interface AdminDashboardApi {
  getDashboard: () => Promise<AdminDashboardData>;
}
