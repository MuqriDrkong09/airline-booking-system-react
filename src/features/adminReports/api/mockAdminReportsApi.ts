import type { ReportFilters } from '../types/adminReport';
import type { AdminReportsApi } from './adminReportsApi.types';
import { createMockAdminReportsData } from './adminReportsData';

const MOCK_DELAY_MS = process.env.NODE_ENV === 'test' ? 0 : 280;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function createMockAdminReportsApi(
  options: { delayMs?: number } = {},
): AdminReportsApi & { reset: () => void } {
  const delayMs = options.delayMs ?? MOCK_DELAY_MS;

  return {
    reset() {
      // Stateless mock — reset kept for test symmetry with other admin APIs.
    },
    async getReports(filters: ReportFilters) {
      await delay(delayMs);
      return createMockAdminReportsData(filters);
    },
  };
}

export const mockAdminReportsApi = createMockAdminReportsApi();
