import {
  CABIN_CLASS_OPTIONS,
  FLIGHT_OPERATIONAL_STATUS_LABELS,
  FLIGHT_OPERATIONAL_STATUSES,
  MOCK_AIRLINES,
  MOCK_AIRPORTS,
} from '@/features/flights';
import type { AppSelectOption } from '@/components/common/AppSelect';

export const AIRCRAFT_OPTIONS: readonly AppSelectOption[] = [
  { value: 'A320', label: 'Airbus A320' },
  { value: 'A321', label: 'Airbus A321' },
  { value: 'A330', label: 'Airbus A330' },
  { value: 'A350', label: 'Airbus A350' },
  { value: 'B737', label: 'Boeing 737' },
  { value: 'B777', label: 'Boeing 777' },
  { value: 'B787', label: 'Boeing 787' },
] as const;

export const AIRLINE_OPTIONS: readonly AppSelectOption[] = MOCK_AIRLINES.map((airline) => ({
  value: airline.code,
  label: `${airline.code} · ${airline.name}`,
}));

export const AIRPORT_OPTIONS: readonly AppSelectOption[] = MOCK_AIRPORTS.filter(
  (airport) => airport.active,
).map((airport) => ({
  value: airport.code,
  label: `${airport.code} · ${airport.city}`,
}));

export const STATUS_FILTER_OPTIONS: readonly AppSelectOption[] = [
  { value: '', label: 'All statuses' },
  ...FLIGHT_OPERATIONAL_STATUSES.map((status) => ({
    value: status,
    label: FLIGHT_OPERATIONAL_STATUS_LABELS[status],
  })),
];

export const STATUS_OPTIONS: readonly AppSelectOption[] = FLIGHT_OPERATIONAL_STATUSES.map(
  (status) => ({
    value: status,
    label: FLIGHT_OPERATIONAL_STATUS_LABELS[status],
  }),
);

export const AIRLINE_FILTER_OPTIONS: readonly AppSelectOption[] = [
  { value: '', label: 'All airlines' },
  ...AIRLINE_OPTIONS,
];

export const AIRPORT_FILTER_OPTIONS: readonly AppSelectOption[] = [
  { value: '', label: 'All airports' },
  ...AIRPORT_OPTIONS,
];

export { CABIN_CLASS_OPTIONS };
