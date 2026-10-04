import type { AxiosInstance } from 'axios';
import {
  adminDashboardKeys,
  createHttpAdminDashboardApi,
  createMockAdminDashboardApi,
  createMockAdminDashboardData,
  fetchAdminDashboard,
  formatDashboardCurrency,
  formatDashboardNumber,
  formatPercent,
  mockAdminDashboardApi,
} from '@/features/adminDashboard';
import { apiClient } from '@/services/api/client';

describe('admin dashboard formatters', () => {
  it('formats currency, numbers, and percents', () => {
    expect(formatDashboardCurrency(728_880, 'USD')).toMatch(/728/);
    expect(formatDashboardCurrency(100)).toMatch(/100/);
    expect(formatDashboardNumber(1842)).toBe(new Intl.NumberFormat(undefined).format(1842));
    expect(formatPercent(0.91)).toBe('91%');
    expect(formatPercent(0.875)).toBe('88%');
  });
});

describe('adminDashboardKeys', () => {
  it('builds stable query keys', () => {
    expect(adminDashboardKeys.all).toEqual(['admin-dashboard']);
    expect(adminDashboardKeys.detail()).toEqual(['admin-dashboard', 'detail']);
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

  it('uses default seed data when no custom payload is provided', async () => {
    const api = createMockAdminDashboardApi({ delayMs: 0 });
    const data = await api.getDashboard();

    expect(data.metrics.currency).toBe('USD');
    expect(data.airlinePerformance.map((row) => row.code)).toEqual([
      'MH',
      'AK',
      'SQ',
      'EK',
      'QR',
    ]);
  });

  it('resolves through the shared mock singleton and fetch helper', async () => {
    const data = await fetchAdminDashboard();

    expect(data.metrics.totalBookings).toBeGreaterThan(0);
    await expect(mockAdminDashboardApi.getDashboard()).resolves.toMatchObject({
      metrics: expect.objectContaining({
        totalUsers: expect.any(Number),
      }),
    });
  });
});

describe('createHttpAdminDashboardApi', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('GETs /admin/dashboard and returns the response body', async () => {
    const seed = createMockAdminDashboardData();
    const get = jest.fn().mockResolvedValue({ data: seed });
    const client = { get } as unknown as AxiosInstance;

    const api = createHttpAdminDashboardApi(client);
    const data = await api.getDashboard();

    expect(get).toHaveBeenCalledTimes(1);
    expect(get).toHaveBeenCalledWith('/admin/dashboard');
    expect(data).toEqual(seed);
  });

  it('uses the shared apiClient when no client is injected', async () => {
    const seed = createMockAdminDashboardData();
    const get = jest.spyOn(apiClient, 'get').mockResolvedValue({
      data: seed,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as never,
    });

    const api = createHttpAdminDashboardApi();
    const data = await api.getDashboard();

    expect(get).toHaveBeenCalledWith('/admin/dashboard');
    expect(data).toEqual(seed);
  });

  it('propagates HTTP client errors', async () => {
    const get = jest.fn().mockRejectedValue(new Error('Network error'));
    const client = { get } as unknown as AxiosInstance;
    const api = createHttpAdminDashboardApi(client);

    await expect(api.getDashboard()).rejects.toThrow('Network error');
  });
});
