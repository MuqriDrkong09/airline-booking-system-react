import type { Airport } from '../types';

export function formatAirportOptionLabel(airport: Airport): string {
  return `${airport.code} — ${airport.name}`;
}

export function formatAirportOptionSecondary(airport: Airport): string {
  return `${airport.city}, ${airport.country}`;
}

export function formatAirportInputValue(airport: Airport | null | undefined): string {
  if (!airport) {
    return '';
  }

  return `${airport.code} — ${airport.city}`;
}
