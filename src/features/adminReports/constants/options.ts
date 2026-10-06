import type { ReportPeriodPreset } from '../types/adminReport';

export const REPORT_PERIOD_OPTIONS: readonly {
  value: ReportPeriodPreset;
  label: string;
}[] = [
  { value: 'today', label: 'Today' },
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: '3m', label: '3 months' },
  { value: '12m', label: '12 months' },
  { value: 'custom', label: 'Custom' },
] as const;

export const REPORT_CHART_COLORS = [
  '#0B6E4F',
  '#1B9AAA',
  '#F4A261',
  '#E76F51',
  '#3D5A80',
  '#9B5DE5',
] as const;
