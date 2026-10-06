export const REPORT_PERIOD_PRESETS = [
  'today',
  '7d',
  '30d',
  '3m',
  '12m',
  'custom',
] as const;

export type ReportPeriodPreset = (typeof REPORT_PERIOD_PRESETS)[number];

export interface ReportFilters {
  preset: ReportPeriodPreset;
  /** Inclusive start date `YYYY-MM-DD` (required when preset is custom). */
  startDate: string;
  /** Inclusive end date `YYYY-MM-DD` (required when preset is custom). */
  endDate: string;
}

export interface ResolvedReportRange {
  preset: ReportPeriodPreset;
  startDate: string;
  endDate: string;
}

export interface ReportTimeSeriesPoint {
  date: string;
  label: string;
  value: number;
}

export interface ReportSummary {
  revenue: number;
  bookings: number;
  passengers: number;
  cancellations: number;
  refunds: number;
  refundAmount: number;
  currency: string;
}

export interface ReportRouteStat {
  route: string;
  origin: string;
  destination: string;
  bookings: number;
  revenue: number;
}

export interface ReportDestinationStat {
  destination: string;
  city: string;
  bookings: number;
  passengers: number;
}

export interface ReportAirlinePerformance {
  airline: string;
  code: string;
  bookings: number;
  revenue: number;
  passengers: number;
  cancellations: number;
  onTimeRate: number;
}

export interface AdminReportsData {
  range: ResolvedReportRange;
  summary: ReportSummary;
  revenueSeries: ReportTimeSeriesPoint[];
  bookingsSeries: ReportTimeSeriesPoint[];
  passengersSeries: ReportTimeSeriesPoint[];
  cancellationsSeries: ReportTimeSeriesPoint[];
  refundsSeries: ReportTimeSeriesPoint[];
  popularRoutes: ReportRouteStat[];
  popularDestinations: ReportDestinationStat[];
  airlinePerformance: ReportAirlinePerformance[];
  generatedAt: string;
}

export const EMPTY_REPORT_FILTERS: ReportFilters = {
  preset: '30d',
  startDate: '',
  endDate: '',
};
