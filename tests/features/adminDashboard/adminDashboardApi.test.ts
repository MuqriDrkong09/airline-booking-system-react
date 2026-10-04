import {
  createMockAdminDashboardApi,
  createMockAdminDashboardData,
  formatDashboardCurrency,
  formatDashboardNumber,
  formatPercent,
} from '@/features/adminDashboard';

describe('admin dashboard formatters', () => {
  it('formats currency, numbers, and percents', () => {
    expect(formatDashboardCurrency(728_880, 'USD')).toMatch(/728/);
    expect(formatDashboardNumber(1842)).toBe(new Intl.NumberFormat(undefined).format(1842));
    expect(formatPercent(0.91)).toBe('91%');
  });
});

describe('mockAdminDashboardApi', () => {
  it('returns metrics and chart series from seed data', async () => {
    const seed = createMockAdminDashboardData();
    const api = createMockAdminDashboardApi({ delayMs: 0, data: seed });
    const data = await api.getDashboard();

    expect(data.metrics.totalBookings).toBe(seed.metrics.totalBookings);
    expect(data.metrics.totalRevenue).toBe(seed.metrics.totalRevenue);
    expect(data.metrics.totalUsers).toBe(seed.metrics.totalUsers);
    expect(data.metrics.activeFlights).toBe(seed.metrics.activeFlights);
    expect(data.metrics.cancelledFlights).toBe(seed.metrics.cancelledFlights);
    expect(data.metrics.completedFlights).toBe(seed.metrics.completedFlights);
    expect(data.bookingsOverTime).toHaveLength(6);
    expect(data.revenueOverTime).toHaveLength(6);
    expect(data.popularDestinations[0]?.destination).toBe('NRT');
    expect(data.bookingStatusDistribution.length).toBeGreaterThan(0);
    expect(data.airlinePerformance.length).toBeGreaterThan(0);
    expect(data.generatedAt).toEqual(expect.any(String));
  });
});
