import { addDaysIso, isValidCalendarDate, todayIsoDate } from '@/features/flights/utils/dates';
import type {
  ReportFilters,
  ReportPeriodPreset,
  ResolvedReportRange,
} from '../types/adminReport';

function addMonthsIso(isoDate: string, months: number): string {
  const [yearText, monthText, dayText] = isoDate.split('-');
  const date = new Date(Number(yearText), Number(monthText) - 1, Number(dayText));
  date.setMonth(date.getMonth() + months);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function resolveReportRange(
  filters: ReportFilters,
  todayIso = todayIsoDate(),
): ResolvedReportRange {
  switch (filters.preset) {
    case 'today':
      return { preset: 'today', startDate: todayIso, endDate: todayIso };
    case '7d':
      return {
        preset: '7d',
        startDate: addDaysIso(todayIso, -6),
        endDate: todayIso,
      };
    case '30d':
      return {
        preset: '30d',
        startDate: addDaysIso(todayIso, -29),
        endDate: todayIso,
      };
    case '3m':
      return {
        preset: '3m',
        startDate: addMonthsIso(todayIso, -3),
        endDate: todayIso,
      };
    case '12m':
      return {
        preset: '12m',
        startDate: addMonthsIso(todayIso, -12),
        endDate: todayIso,
      };
    case 'custom': {
      const startDate = isValidCalendarDate(filters.startDate) ? filters.startDate : todayIso;
      const endDate = isValidCalendarDate(filters.endDate) ? filters.endDate : todayIso;
      if (endDate < startDate) {
        return { preset: 'custom', startDate: endDate, endDate: startDate };
      }
      return { preset: 'custom', startDate, endDate };
    }
    default: {
      const _exhaustive: never = filters.preset;
      return _exhaustive;
    }
  }
}

export function isCustomRangeReady(filters: ReportFilters): boolean {
  if (filters.preset !== 'custom') {
    return true;
  }
  return (
    isValidCalendarDate(filters.startDate) &&
    isValidCalendarDate(filters.endDate) &&
    filters.endDate >= filters.startDate
  );
}

export function daysInclusive(startDate: string, endDate: string): number {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  const diff = Math.round((end.getTime() - start.getTime()) / 86_400_000);
  return Math.max(1, diff + 1);
}

export function enumerateIsoDates(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  let cursor = startDate;
  while (cursor <= endDate) {
    dates.push(cursor);
    cursor = addDaysIso(cursor, 1);
  }
  return dates;
}

export function formatReportPeriodLabel(preset: ReportPeriodPreset): string {
  switch (preset) {
    case 'today':
      return 'Today';
    case '7d':
      return 'Last 7 days';
    case '30d':
      return 'Last 30 days';
    case '3m':
      return 'Last 3 months';
    case '12m':
      return 'Last 12 months';
    case 'custom':
      return 'Custom range';
    default: {
      const _exhaustive: never = preset;
      return _exhaustive;
    }
  }
}
