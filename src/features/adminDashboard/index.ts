export type {
  AdminDashboardData,
  AirlinePerformanceRow,
  BookingStatusSlice,
  DashboardMetrics,
  DestinationStat,
  TimeSeriesPoint,
} from './types/dashboard';
export {
  adminDashboardApi,
  adminDashboardKeys,
  fetchAdminDashboard,
  createHttpAdminDashboardApi,
  createMockAdminDashboardApi,
  mockAdminDashboardApi,
  createMockAdminDashboardData,
} from './api';
export type { AdminDashboardApi } from './api';
export { useAdminDashboardQuery } from './hooks/useAdminDashboard';
export {
  DASHBOARD_CHART_COLORS,
  formatDashboardCurrency,
  formatDashboardNumber,
  formatPercent,
} from './utils/formatDashboard';
export { DashboardMetricCard } from './components/DashboardMetricCard';
export type { DashboardMetricCardProps } from './components/DashboardMetricCard';
export {
  AirlinePerformanceChart,
  BookingStatusChart,
  BookingsOverTimeChart,
  PopularDestinationsChart,
  RevenueOverTimeChart,
} from './components/DashboardCharts';
export { AdminDashboardView } from './components/AdminDashboardView';
