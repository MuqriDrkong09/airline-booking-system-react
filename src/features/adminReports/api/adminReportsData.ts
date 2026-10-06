import type {
  AdminReportsData,
  ReportAirlinePerformance,
  ReportDestinationStat,
  ReportFilters,
  ReportRouteStat,
  ReportTimeSeriesPoint,
} from '../types/adminReport';
import { formatSeriesLabel } from '../utils/formatReport';
import {
  daysInclusive,
  enumerateIsoDates,
  resolveReportRange,
} from '../utils/reportDateRange';

function hashSeed(input: string): number {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) >>> 0;
  }
  return hash || 1;
}

function seriesFor(
  dates: readonly string[],
  base: number,
  variance: number,
  seedKey: string,
): ReportTimeSeriesPoint[] {
  const dayCount = dates.length;
  return dates.map((date, index) => {
    const wave = Math.sin((index + 1) * 0.7) * variance;
    const jitter = (hashSeed(`${seedKey}-${date}`) % (variance + 1)) - variance / 2;
    const value = Math.max(0, Math.round(base + wave + jitter));
    return {
      date,
      label: formatSeriesLabel(date, dayCount),
      value,
    };
  });
}

function scaleRoutes(multiplier: number): ReportRouteStat[] {
  const routes: Omit<ReportRouteStat, 'bookings' | 'revenue'>[] = [
    { route: 'KUL → SIN', origin: 'KUL', destination: 'SIN' },
    { route: 'KUL → NRT', origin: 'KUL', destination: 'NRT' },
    { route: 'SIN → BKK', origin: 'SIN', destination: 'BKK' },
    { route: 'KUL → BKK', origin: 'KUL', destination: 'BKK' },
    { route: 'SIN → HKG', origin: 'SIN', destination: 'HKG' },
    { route: 'KUL → DXB', origin: 'KUL', destination: 'DXB' },
  ];
  const bookingsBase = [186, 164, 142, 128, 110, 96];
  const revenueBase = [92_400, 148_200, 61_500, 54_800, 78_200, 112_400];

  return routes.map((route, index) => ({
    ...route,
    bookings: Math.max(1, Math.round(bookingsBase[index]! * multiplier)),
    revenue: Math.max(100, Math.round(revenueBase[index]! * multiplier)),
  }));
}

function scaleDestinations(multiplier: number): ReportDestinationStat[] {
  const rows = [
    { destination: 'SIN', city: 'Singapore', bookings: 241, passengers: 518 },
    { destination: 'NRT', city: 'Tokyo', bookings: 218, passengers: 472 },
    { destination: 'BKK', city: 'Bangkok', bookings: 196, passengers: 410 },
    { destination: 'HKG', city: 'Hong Kong', bookings: 154, passengers: 336 },
    { destination: 'DXB', city: 'Dubai', bookings: 132, passengers: 298 },
    { destination: 'ICN', city: 'Seoul', bookings: 118, passengers: 254 },
  ];
  return rows.map((row) => ({
    ...row,
    bookings: Math.max(1, Math.round(row.bookings * multiplier)),
    passengers: Math.max(1, Math.round(row.passengers * multiplier)),
  }));
}

function scaleAirlines(multiplier: number): ReportAirlinePerformance[] {
  const rows = [
    {
      airline: 'Malaysia Airlines',
      code: 'MH',
      bookings: 412,
      revenue: 186_400,
      passengers: 890,
      cancellations: 28,
      onTimeRate: 0.91,
    },
    {
      airline: 'AirAsia',
      code: 'AK',
      bookings: 388,
      revenue: 142_250,
      passengers: 842,
      cancellations: 36,
      onTimeRate: 0.87,
    },
    {
      airline: 'Singapore Airlines',
      code: 'SQ',
      bookings: 276,
      revenue: 198_720,
      passengers: 610,
      cancellations: 14,
      onTimeRate: 0.94,
    },
    {
      airline: 'Emirates',
      code: 'EK',
      bookings: 198,
      revenue: 156_100,
      passengers: 452,
      cancellations: 12,
      onTimeRate: 0.9,
    },
    {
      airline: 'Qatar Airways',
      code: 'QR',
      bookings: 164,
      revenue: 121_480,
      passengers: 368,
      cancellations: 9,
      onTimeRate: 0.92,
    },
  ];

  return rows.map((row) => ({
    ...row,
    bookings: Math.max(1, Math.round(row.bookings * multiplier)),
    revenue: Math.max(100, Math.round(row.revenue * multiplier)),
    passengers: Math.max(1, Math.round(row.passengers * multiplier)),
    cancellations: Math.max(0, Math.round(row.cancellations * multiplier)),
  }));
}

/**
 * Builds deterministic mock report data for the resolved filter range.
 * Longer ranges scale totals up; series length follows the inclusive day span
 * (sampled weekly for very long ranges).
 */
export function createMockAdminReportsData(filters: ReportFilters): AdminReportsData {
  const range = resolveReportRange(filters);
  const allDates = enumerateIsoDates(range.startDate, range.endDate);
  const dayCount = daysInclusive(range.startDate, range.endDate);
  const multiplier = Math.max(0.2, dayCount / 30);

  const sampleStep = dayCount > 90 ? 7 : dayCount > 45 ? 2 : 1;
  const dates = allDates.filter((_, index) => index % sampleStep === 0 || index === allDates.length - 1);

  const revenueSeries = seriesFor(dates, 18_000 * (sampleStep / 1), 4_200, 'revenue');
  const bookingsSeries = seriesFor(dates, 48 * sampleStep, 14, 'bookings');
  const passengersSeries = seriesFor(dates, 96 * sampleStep, 28, 'passengers');
  const cancellationsSeries = seriesFor(dates, 6 * sampleStep, 3, 'cancellations');
  const refundsSeries = seriesFor(dates, 4 * sampleStep, 2, 'refunds');

  const bookings = bookingsSeries.reduce((sum, point) => sum + point.value, 0);
  const passengers = passengersSeries.reduce((sum, point) => sum + point.value, 0);
  const cancellations = cancellationsSeries.reduce((sum, point) => sum + point.value, 0);
  const refunds = refundsSeries.reduce((sum, point) => sum + point.value, 0);
  const revenue = revenueSeries.reduce((sum, point) => sum + point.value, 0);
  const refundAmount = Math.round(refunds * 180);

  return {
    range,
    summary: {
      revenue,
      bookings,
      passengers,
      cancellations,
      refunds,
      refundAmount,
      currency: 'USD',
    },
    revenueSeries,
    bookingsSeries,
    passengersSeries,
    cancellationsSeries,
    refundsSeries,
    popularRoutes: scaleRoutes(multiplier),
    popularDestinations: scaleDestinations(multiplier),
    airlinePerformance: scaleAirlines(multiplier),
    generatedAt: new Date().toISOString(),
  };
}
