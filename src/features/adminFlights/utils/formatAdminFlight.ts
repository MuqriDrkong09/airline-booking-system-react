import {
  FLIGHT_OPERATIONAL_STATUS_LABELS,
  MOCK_AIRLINES,
  type FlightOperationalStatus,
} from '@/features/flights';
import type { AdminFlight } from '../types/adminFlight';
import type { AppBadgeTone } from '@/components/common/AppBadge';

export function getAirlineLabel(code: string): string {
  const airline = MOCK_AIRLINES.find((item) => item.code === code);
  return airline ? `${airline.code} · ${airline.name}` : code;
}

export function formatFlightDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function formatFareClasses(fareClasses: readonly string[]): string {
  return fareClasses.join(', ');
}

export function getStatusLabel(status: FlightOperationalStatus): string {
  return FLIGHT_OPERATIONAL_STATUS_LABELS[status];
}

export function getStatusTone(status: FlightOperationalStatus): AppBadgeTone {
  switch (status) {
    case 'SCHEDULED':
      return 'info';
    case 'BOARDING':
      return 'primary';
    case 'DELAYED':
      return 'warning';
    case 'DEPARTED':
      return 'secondary';
    case 'ARRIVED':
      return 'success';
    case 'CANCELLED':
      return 'error';
    default:
      return 'default';
  }
}

export function sortAdminFlights(flights: readonly AdminFlight[]): AdminFlight[] {
  return [...flights].sort(
    (left, right) => new Date(left.departure).getTime() - new Date(right.departure).getTime(),
  );
}
