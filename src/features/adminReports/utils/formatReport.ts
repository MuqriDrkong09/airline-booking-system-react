export function formatReportCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatReportNumber(value: number): string {
  return new Intl.NumberFormat(undefined).format(value);
}

export function formatReportPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat(undefined, {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatSeriesLabel(isoDate: string, dayCount: number): string {
  const date = new Date(`${isoDate}T00:00:00`);
  if (dayCount <= 31) {
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }
  if (dayCount <= 100) {
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }
  return date.toLocaleDateString(undefined, { month: 'short', year: '2-digit' });
}
