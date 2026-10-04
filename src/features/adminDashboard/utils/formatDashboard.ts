export function formatDashboardCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDashboardNumber(value: number): string {
  return new Intl.NumberFormat(undefined).format(value);
}

export function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export const DASHBOARD_CHART_COLORS = [
  '#0B6E4F',
  '#1B9AAA',
  '#F4A261',
  '#E76F51',
  '#3D5A80',
  '#9B5DE5',
] as const;
