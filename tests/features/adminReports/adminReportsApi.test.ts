import type { AxiosInstance } from 'axios';
import {
  adminReportKeys,
  createHttpAdminReportsApi,
  createMockAdminReportsApi,
  createMockAdminReportsData,
  daysInclusive,
  EMPTY_REPORT_FILTERS,
  fetchAdminReports,
  formatReportCurrency,
  formatReportNumber,
  formatReportPercent,
  isCustomRangeReady,
  mockAdminReportsApi,
  resolveReportRange,
} from '@/features/adminReports';
import { apiClient } from '@/services/api/client';

describe('admin reports formatters', () => {
  it('formats currency, numbers, and percents', () => {
    expect(formatReportCurrency(72_880, 'USD')).toMatch(/72/);
    expect(formatReportNumber(1842)).toBe(new Intl.NumberFormat(undefined).format(1842));
    expect(formatReportPercent(0.91)).toBe('91%');
    expect(formatReportPercent(0.875)).toBe('88%');
  });
});

describe('report date range helpers', () => {
  it('resolves presets relative to a fixed today', () => {
    expect(resolveReportRange({ ...EMPTY_REPORT_FILTERS, preset: 'today' }, '2026-10-05')).toEqual({
      preset: 'today',
      startDate: '2026-10-05',
      endDate: '2026-10-05',
    });
    expect(resolveReportRange({ ...EMPTY_REPORT_FILTERS, preset: '7d' }, '2026-10-05')).toEqual({
      preset: '7d',
      startDate: '2026-09-29',
      endDate: '2026-10-05',
    });
    expect(resolveReportRange({ ...EMPTY_REPORT_FILTERS, preset: '30d' }, '2026-10-05')).toEqual({
      preset: '30d',
      startDate: '2026-09-06',
      endDate: '2026-10-05',
    });
  });

  it('normalizes custom ranges and validates readiness', () => {
    expect(
      resolveReportRange(
        { preset: 'custom', startDate: '2026-10-01', endDate: '2026-09-01' },
        '2026-10-05',
      ),
    ).toEqual({
      preset: 'custom',
      startDate: '2026-09-01',
      endDate: '2026-10-01',
    });

    expect(isCustomRangeReady({ ...EMPTY_REPORT_FILTERS, preset: '30d' })).toBe(true);
    expect(
      isCustomRangeReady({ preset: 'custom', startDate: '', endDate: '2026-10-01' }),
    ).toBe(false);
    expect(
      isCustomRangeReady({
        preset: 'custom',
        startDate: '2026-10-01',
        endDate: '2026-09-01',
      }),
    ).toBe(false);
    expect(
      isCustomRangeReady({
        preset: 'custom',
        startDate: '2026-09-01',
        endDate: '2026-10-01',
      }),
    ).toBe(true);
    expect(daysInclusive('2026-10-01', '2026-10-05')).toBe(5);
  });
});

describe('adminReportKeys', () => {
  it('builds stable query keys', () => {
    expect(adminReportKeys.all).toEqual(['admin-reports']);
    expect(adminReportKeys.detail(EMPTY_REPORT_FILTERS)).toEqual([
      'admin-reports',
      'detail',
      EMPTY_REPORT_FILTERS,
    ]);
  });
});

describe('mockAdminReportsApi', () => {
  it('returns summary series and ranking data for the resolved range', async () => {
    const filters = EMPTY_REPORT_FILTERS;
    const seed = createMockAdminReportsData(filters);
    const api = createMockAdminReportsApi({ delayMs: 0 });
    const data = await api.getReports(filters);

    expect(data.range.preset).toBe('30d');
    expect(data.summary.currency).toBe('USD');
    expect(data.summary.revenue).toBe(seed.summary.revenue);
    expect(data.summary.bookings).toBe(seed.summary.bookings);
    expect(data.revenueSeries).toHaveLength(seed.revenueSeries.length);
    expect(data.bookingsSeries.length).toBeGreaterThan(0);
    expect(data.passengersSeries.length).toBeGreaterThan(0);
    expect(data.cancellationsSeries.length).toBeGreaterThan(0);
    expect(data.refundsSeries.length).toBeGreaterThan(0);
    expect(data.popularRoutes[0]?.route).toBe('KUL → SIN');
    expect(data.popularDestinations[0]?.destination).toBe('SIN');
    expect(data.airlinePerformance.map((row) => row.code)).toEqual([
      'MH',
      'AK',
      'SQ',
      'EK',
      'QR',
    ]);
    expect(data.generatedAt).toEqual(expect.any(String));
  });

  it('scales longer ranges and supports custom dates', async () => {
    const api = createMockAdminReportsApi({ delayMs: 0 });
    const short = await api.getReports({ ...EMPTY_REPORT_FILTERS, preset: '7d' });
    const long = await api.getReports({ ...EMPTY_REPORT_FILTERS, preset: '12m' });
    const custom = await api.getReports({
      preset: 'custom',
      startDate: '2026-01-01',
      endDate: '2026-01-10',
    });

    expect(long.summary.bookings).toBeGreaterThan(short.summary.bookings);
    expect(custom.range).toEqual({
      preset: 'custom',
      startDate: '2026-01-01',
      endDate: '2026-01-10',
    });
    expect(custom.revenueSeries.length).toBeGreaterThan(0);
  });

  it('resolves through the shared mock singleton and fetch helper', async () => {
    const data = await fetchAdminReports(EMPTY_REPORT_FILTERS);

    expect(data.summary.bookings).toBeGreaterThan(0);
    await expect(mockAdminReportsApi.getReports(EMPTY_REPORT_FILTERS)).resolves.toMatchObject({
      summary: expect.objectContaining({
        currency: 'USD',
      }),
    });
  });
});

describe('createHttpAdminReportsApi', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('GETs /admin/reports with resolved range params', async () => {
    const seed = createMockAdminReportsData(EMPTY_REPORT_FILTERS);
    const get = jest.fn().mockResolvedValue({ data: seed });
    const client = { get } as unknown as AxiosInstance;

    const api = createHttpAdminReportsApi(client);
    const data = await api.getReports(EMPTY_REPORT_FILTERS);

    expect(get).toHaveBeenCalledTimes(1);
    expect(get).toHaveBeenCalledWith('/admin/reports', {
      params: {
        preset: seed.range.preset,
        startDate: seed.range.startDate,
        endDate: seed.range.endDate,
      },
    });
    expect(data).toEqual(seed);
  });

  it('uses the shared apiClient when no client is injected', async () => {
    const seed = createMockAdminReportsData(EMPTY_REPORT_FILTERS);
    const get = jest.spyOn(apiClient, 'get').mockResolvedValue({
      data: seed,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as never,
    });

    const api = createHttpAdminReportsApi();
    const data = await api.getReports(EMPTY_REPORT_FILTERS);

    expect(get).toHaveBeenCalledWith('/admin/reports', expect.any(Object));
    expect(data).toEqual(seed);
  });

  it('propagates HTTP client errors', async () => {
    const get = jest.fn().mockRejectedValue(new Error('Network error'));
    const client = { get } as unknown as AxiosInstance;
    const api = createHttpAdminReportsApi(client);

    await expect(api.getReports(EMPTY_REPORT_FILTERS)).rejects.toThrow('Network error');
  });
});
