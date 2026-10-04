import type { AdminDashboardData } from '../types/dashboard';
import type { AdminDashboardApi } from './adminDashboardApi.types';
import { createMockAdminDashboardData } from './dashboardData';

const MOCK_DELAY_MS = 300;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function createMockAdminDashboardApi(
  options: { delayMs?: number; data?: AdminDashboardData } = {},
): AdminDashboardApi {
  const delayMs = options.delayMs ?? MOCK_DELAY_MS;
  const data = options.data ?? createMockAdminDashboardData();

  return {
    async getDashboard(): Promise<AdminDashboardData> {
      await delay(delayMs);
      return {
        ...data,
        generatedAt: new Date().toISOString(),
      };
    },
  };
}

export const mockAdminDashboardApi = createMockAdminDashboardApi();
