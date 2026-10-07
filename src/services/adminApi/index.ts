import { env } from '@/config/env';
import { createHttpAdminAircraftApi } from '@/features/adminAircraft/api/httpAdminAircraftApi';
import { mockAdminAircraftApi } from '@/features/adminAircraft/api/mockAdminAircraftApi';
import { createHttpAdminAirportsApi } from '@/features/adminAirports/api/httpAdminAirportsApi';
import { mockAdminAirportsApi } from '@/features/adminAirports/api/mockAdminAirportsApi';
import { createHttpAdminBookingsApi } from '@/features/adminBookings/api/httpAdminBookingsApi';
import { mockAdminBookingsApi } from '@/features/adminBookings/api/mockAdminBookingsApi';
import { createHttpAdminDashboardApi } from '@/features/adminDashboard/api/httpAdminDashboardApi';
import { mockAdminDashboardApi } from '@/features/adminDashboard/api/mockAdminDashboardApi';
import { createHttpAdminFlightsApi } from '@/features/adminFlights/api/httpAdminFlightsApi';
import { mockAdminFlightsApi } from '@/features/adminFlights/api/mockAdminFlightsApi';
import { createHttpAdminPromoCodesApi } from '@/features/adminPromoCodes/api/httpAdminPromoCodesApi';
import { mockAdminPromoCodesApi } from '@/features/adminPromoCodes/api/mockAdminPromoCodesApi';
import { createHttpAdminReportsApi } from '@/features/adminReports/api/httpAdminReportsApi';
import { mockAdminReportsApi } from '@/features/adminReports/api/mockAdminReportsApi';
import { createHttpAdminUsersApi } from '@/features/adminUsers/api/httpAdminUsersApi';
import { mockAdminUsersApi } from '@/features/adminUsers/api/mockAdminUsersApi';

/**
 * Domain facade: admin operations.
 * Prefer this from non-UI code; feature modules keep React Query keys/hooks.
 */
export const adminApi = {
  dashboard: env.useMockAuth ? mockAdminDashboardApi : createHttpAdminDashboardApi(),
  flights: env.useMockAuth ? mockAdminFlightsApi : createHttpAdminFlightsApi(),
  airports: env.useMockAuth ? mockAdminAirportsApi : createHttpAdminAirportsApi(),
  aircraft: env.useMockAuth ? mockAdminAircraftApi : createHttpAdminAircraftApi(),
  bookings: env.useMockAuth ? mockAdminBookingsApi : createHttpAdminBookingsApi(),
  users: env.useMockAuth ? mockAdminUsersApi : createHttpAdminUsersApi(),
  promoCodes: env.useMockAuth ? mockAdminPromoCodesApi : createHttpAdminPromoCodesApi(),
  reports: env.useMockAuth ? mockAdminReportsApi : createHttpAdminReportsApi(),
} as const;

export type AdminApi = typeof adminApi;
