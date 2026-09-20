import { CABIN_CLASSES, type CabinClass } from '../types';
import type { FlightFilterBounds, FlightFilterState } from '../types/flight';

export const FILTER_PARAM_KEYS = [
  'f_price',
  'f_airlines',
  'f_stops',
  'f_dep',
  'f_arr',
  'f_duration',
  'f_cabin',
  'f_refundable',
  'f_baggage',
  'sort',
] as const;

export const DEFAULT_FLIGHT_FILTERS: FlightFilterState = {
  priceMin: null,
  priceMax: null,
  airlines: [],
  stops: [],
  departureHourStart: null,
  departureHourEnd: null,
  arrivalHourStart: null,
  arrivalHourEnd: null,
  durationMax: null,
  cabinClasses: [],
  refundableOnly: false,
  baggageIncludedOnly: false,
};

function parseIntOrNull(value: string | undefined): number | null {
  if (value === undefined || value === '') {
    return null;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseCsv(value: string | null): string[] {
  if (!value?.trim()) {
    return [];
  }
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseHourRange(value: string | null): { start: number | null; end: number | null } {
  if (!value?.trim()) {
    return { start: null, end: null };
  }
  const [startText, endText] = value.split('-');
  return {
    start: parseIntOrNull(startText),
    end: parseIntOrNull(endText),
  };
}

function parsePriceRange(value: string | null): { min: number | null; max: number | null } {
  if (!value?.trim()) {
    return { min: null, max: null };
  }
  const [minText, maxText] = value.split('-');
  return {
    min: parseIntOrNull(minText),
    max: parseIntOrNull(maxText),
  };
}

export function parseFlightFilterParams(params: URLSearchParams): FlightFilterState {
  const price = parsePriceRange(params.get('f_price'));
  const departure = parseHourRange(params.get('f_dep'));
  const arrival = parseHourRange(params.get('f_arr'));
  const stops = parseCsv(params.get('f_stops'))
    .map((item) => Number.parseInt(item, 10))
    .filter((item): item is 0 | 1 | 2 => item === 0 || item === 1 || item === 2);
  const cabinClasses = parseCsv(params.get('f_cabin')).filter((item): item is CabinClass =>
    (CABIN_CLASSES as readonly string[]).includes(item),
  );

  return {
    priceMin: price.min,
    priceMax: price.max,
    airlines: parseCsv(params.get('f_airlines')).map((code) => code.toUpperCase()),
    stops,
    departureHourStart: departure.start,
    departureHourEnd: departure.end,
    arrivalHourStart: arrival.start,
    arrivalHourEnd: arrival.end,
    durationMax: parseIntOrNull(params.get('f_duration') ?? undefined),
    cabinClasses,
    refundableOnly: params.get('f_refundable') === '1',
    baggageIncludedOnly: params.get('f_baggage') === '1',
  };
}

export function clearFlightFilterParams(params: URLSearchParams): URLSearchParams {
  const next = new URLSearchParams(params);
  FILTER_PARAM_KEYS.forEach((key) => {
    if (key !== 'sort') {
      next.delete(key);
    }
  });
  return next;
}

export function writeFlightFilterParams(
  params: URLSearchParams,
  filters: FlightFilterState,
  bounds?: FlightFilterBounds | null,
): URLSearchParams {
  const next = clearFlightFilterParams(params);

  const priceMinActive =
    filters.priceMin !== null &&
    (bounds ? filters.priceMin > bounds.priceMin : true);
  const priceMaxActive =
    filters.priceMax !== null &&
    (bounds ? filters.priceMax < bounds.priceMax : true);

  if (priceMinActive || priceMaxActive) {
    const min = filters.priceMin ?? bounds?.priceMin ?? 0;
    const max = filters.priceMax ?? bounds?.priceMax ?? min;
    next.set('f_price', `${min}-${max}`);
  }

  if (filters.airlines.length > 0) {
    next.set('f_airlines', filters.airlines.join(','));
  }

  if (filters.stops.length > 0) {
    next.set('f_stops', filters.stops.join(','));
  }

  const depStartActive = filters.departureHourStart !== null && filters.departureHourStart > 0;
  const depEndActive = filters.departureHourEnd !== null && filters.departureHourEnd < 24;
  if (depStartActive || depEndActive) {
    next.set(
      'f_dep',
      `${filters.departureHourStart ?? 0}-${filters.departureHourEnd ?? 24}`,
    );
  }

  const arrStartActive = filters.arrivalHourStart !== null && filters.arrivalHourStart > 0;
  const arrEndActive = filters.arrivalHourEnd !== null && filters.arrivalHourEnd < 24;
  if (arrStartActive || arrEndActive) {
    next.set(
      'f_arr',
      `${filters.arrivalHourStart ?? 0}-${filters.arrivalHourEnd ?? 24}`,
    );
  }

  if (
    filters.durationMax !== null &&
    (bounds ? filters.durationMax < bounds.durationMax : true)
  ) {
    next.set('f_duration', String(filters.durationMax));
  }

  if (filters.cabinClasses.length > 0) {
    next.set('f_cabin', filters.cabinClasses.join(','));
  }

  if (filters.refundableOnly) {
    next.set('f_refundable', '1');
  }

  if (filters.baggageIncludedOnly) {
    next.set('f_baggage', '1');
  }

  return next;
}

export function countActiveFlightFilters(
  filters: FlightFilterState,
  bounds?: FlightFilterBounds | null,
): number {
  let count = 0;

  if (
    (filters.priceMin !== null && (!bounds || filters.priceMin > bounds.priceMin)) ||
    (filters.priceMax !== null && (!bounds || filters.priceMax < bounds.priceMax))
  ) {
    count += 1;
  }
  if (filters.airlines.length > 0) {
    count += 1;
  }
  if (filters.stops.length > 0) {
    count += 1;
  }
  if (
    (filters.departureHourStart !== null && filters.departureHourStart > 0) ||
    (filters.departureHourEnd !== null && filters.departureHourEnd < 24)
  ) {
    count += 1;
  }
  if (
    (filters.arrivalHourStart !== null && filters.arrivalHourStart > 0) ||
    (filters.arrivalHourEnd !== null && filters.arrivalHourEnd < 24)
  ) {
    count += 1;
  }
  if (filters.durationMax !== null && (!bounds || filters.durationMax < bounds.durationMax)) {
    count += 1;
  }
  if (filters.cabinClasses.length > 0) {
    count += 1;
  }
  if (filters.refundableOnly) {
    count += 1;
  }
  if (filters.baggageIncludedOnly) {
    count += 1;
  }

  return count;
}

export function areFlightFiltersEqual(a: FlightFilterState, b: FlightFilterState): boolean {
  return (
    a.priceMin === b.priceMin &&
    a.priceMax === b.priceMax &&
    a.departureHourStart === b.departureHourStart &&
    a.departureHourEnd === b.departureHourEnd &&
    a.arrivalHourStart === b.arrivalHourStart &&
    a.arrivalHourEnd === b.arrivalHourEnd &&
    a.durationMax === b.durationMax &&
    a.refundableOnly === b.refundableOnly &&
    a.baggageIncludedOnly === b.baggageIncludedOnly &&
    a.airlines.length === b.airlines.length &&
    a.airlines.every((code, index) => code === b.airlines[index]) &&
    a.stops.length === b.stops.length &&
    a.stops.every((stop, index) => stop === b.stops[index]) &&
    a.cabinClasses.length === b.cabinClasses.length &&
    a.cabinClasses.every((cabin, index) => cabin === b.cabinClasses[index])
  );
}
