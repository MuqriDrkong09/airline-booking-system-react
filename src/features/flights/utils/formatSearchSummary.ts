import type { FlightSearchFormValues } from '../types';
import { formatAirportOptionLabel } from './airportLabels';
import {
  criteriaFromFormValues,
  formatCabinLabel,
  formatPassengerSummary,
} from './searchParams';

export function formatSearchSummary(values: FlightSearchFormValues): string {
  const criteria = criteriaFromFormValues(values);
  const passengers = formatPassengerSummary(
    values.adults,
    values.children,
    values.infants,
  );
  const cabin = formatCabinLabel(values.cabinClass);

  if (values.tripType === 'MULTI_CITY') {
    const route = values.legs
      .map(
        (leg) =>
          `${leg.origin ? formatAirportOptionLabel(leg.origin) : '—'} → ${
            leg.destination ? formatAirportOptionLabel(leg.destination) : '—'
          } on ${leg.departureDate}`,
      )
      .join('; ');
    return `Multi-city · ${route} · ${passengers} · ${cabin}`;
  }

  const from = values.origin ? formatAirportOptionLabel(values.origin) : criteria.from;
  const to = values.destination ? formatAirportOptionLabel(values.destination) : criteria.to;
  const tripLabel = values.tripType === 'ROUND_TRIP' ? 'Round-trip' : 'One-way';
  const dates =
    values.tripType === 'ROUND_TRIP'
      ? `${values.departureDate} → ${values.returnDate}`
      : values.departureDate;

  return `${tripLabel} · ${from} → ${to} · ${dates} · ${passengers} · ${cabin}`;
}
