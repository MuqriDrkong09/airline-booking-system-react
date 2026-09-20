import {
  CABIN_CLASSES,
  TRIP_TYPES,
  type CabinClass,
  type FlightSearchCriteria,
  type FlightSearchFormValues,
  type TripType,
} from '../types';
import { isValidCalendarDate } from './dates';

const TRIP_PARAM = 'trip';
const FROM_PARAM = 'from';
const TO_PARAM = 'to';
const DEPARTURE_PARAM = 'departure';
const RETURN_PARAM = 'return';
const ADULTS_PARAM = 'adults';
const CHILDREN_PARAM = 'children';
const INFANTS_PARAM = 'infants';
const CABIN_PARAM = 'cabin';
const LEGS_PARAM = 'legs';

function parsePositiveInt(value: string | null, fallback: number): number {
  if (value === null || value === '') {
    return fallback;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function parseTripType(value: string | null): TripType | undefined {
  if (!value) {
    return undefined;
  }
  const normalized = value.trim().toUpperCase();
  return (TRIP_TYPES as readonly string[]).includes(normalized)
    ? (normalized as TripType)
    : undefined;
}

function parseCabinClass(value: string | null): CabinClass | undefined {
  if (!value) {
    return undefined;
  }
  const normalized = value.trim().toUpperCase();
  return (CABIN_CLASSES as readonly string[]).includes(normalized)
    ? (normalized as CabinClass)
    : undefined;
}

function parseAirportCode(value: string | null): string | undefined {
  if (!value) {
    return undefined;
  }
  const normalized = value.trim().toUpperCase();
  return /^[A-Z]{3}$/.test(normalized) ? normalized : undefined;
}

function parseLegsParam(value: string | null): FlightSearchCriteria['legs'] | undefined {
  if (!value?.trim()) {
    return undefined;
  }

  const legs = value
    .split(',')
    .map((segment) => segment.trim())
    .filter(Boolean)
    .map((segment) => {
      const [from, to, departure] = segment.split(':').map((part) => part.trim());
      const fromCode = parseAirportCode(from ?? null);
      const toCode = parseAirportCode(to ?? null);
      if (!fromCode || !toCode || !departure || !isValidCalendarDate(departure)) {
        return null;
      }
      return { from: fromCode, to: toCode, departure };
    })
    .filter((leg): leg is NonNullable<typeof leg> => leg !== null);

  return legs.length > 0 ? legs : undefined;
}

export function parseFlightSearchParams(
  params: URLSearchParams,
): Partial<FlightSearchCriteria> | null {
  const from = parseAirportCode(params.get(FROM_PARAM));
  const to = parseAirportCode(params.get(TO_PARAM));
  const departure = params.get(DEPARTURE_PARAM)?.trim() ?? '';
  const returnDate = params.get(RETURN_PARAM)?.trim() ?? '';
  const legs = parseLegsParam(params.get(LEGS_PARAM));
  const tripType =
    parseTripType(params.get(TRIP_PARAM)) ??
    (legs ? 'MULTI_CITY' : returnDate ? 'ROUND_TRIP' : from || to || departure ? 'ONE_WAY' : undefined);
  const cabinClass = parseCabinClass(params.get(CABIN_PARAM));
  const adults = parsePositiveInt(params.get(ADULTS_PARAM), 1);
  const children = parsePositiveInt(params.get(CHILDREN_PARAM), 0);
  const infants = parsePositiveInt(params.get(INFANTS_PARAM), 0);

  const hasAnyCriteria = Boolean(
    tripType ||
      from ||
      to ||
      departure ||
      returnDate ||
      legs ||
      params.has(ADULTS_PARAM) ||
      params.has(CHILDREN_PARAM) ||
      params.has(INFANTS_PARAM) ||
      cabinClass,
  );

  if (!hasAnyCriteria) {
    return null;
  }

  return {
    tripType,
    from,
    to,
    departure: departure && isValidCalendarDate(departure) ? departure : undefined,
    returnDate: returnDate && isValidCalendarDate(returnDate) ? returnDate : undefined,
    adults,
    children,
    infants,
    cabinClass,
    legs,
  };
}

export function serializeFlightSearchCriteria(criteria: FlightSearchCriteria): URLSearchParams {
  const params = new URLSearchParams();
  params.set(TRIP_PARAM, criteria.tripType);
  params.set(ADULTS_PARAM, String(criteria.adults));
  params.set(CHILDREN_PARAM, String(criteria.children));
  params.set(INFANTS_PARAM, String(criteria.infants));
  params.set(CABIN_PARAM, criteria.cabinClass);

  if (criteria.tripType === 'MULTI_CITY' && criteria.legs?.length) {
    params.set(
      LEGS_PARAM,
      criteria.legs.map((leg) => `${leg.from}:${leg.to}:${leg.departure}`).join(','),
    );
    return params;
  }

  params.set(FROM_PARAM, criteria.from);
  params.set(TO_PARAM, criteria.to);
  params.set(DEPARTURE_PARAM, criteria.departure);

  if (criteria.tripType === 'ROUND_TRIP' && criteria.returnDate) {
    params.set(RETURN_PARAM, criteria.returnDate);
  }

  return params;
}

export function criteriaFromFormValues(values: FlightSearchFormValues): FlightSearchCriteria {
  if (values.tripType === 'MULTI_CITY') {
    return {
      tripType: 'MULTI_CITY',
      from: values.legs[0]?.origin?.code ?? '',
      to: values.legs[0]?.destination?.code ?? '',
      departure: values.legs[0]?.departureDate ?? '',
      adults: values.adults,
      children: values.children,
      infants: values.infants,
      cabinClass: values.cabinClass,
      legs: values.legs
        .filter((leg) => leg.origin && leg.destination && leg.departureDate)
        .map((leg) => ({
          from: leg.origin!.code,
          to: leg.destination!.code,
          departure: leg.departureDate,
        })),
    };
  }

  return {
    tripType: values.tripType,
    from: values.origin?.code ?? '',
    to: values.destination?.code ?? '',
    departure: values.departureDate,
    returnDate: values.tripType === 'ROUND_TRIP' ? values.returnDate || undefined : undefined,
    adults: values.adults,
    children: values.children,
    infants: values.infants,
    cabinClass: values.cabinClass,
  };
}

export function formatPassengerSummary(adults: number, children: number, infants: number): string {
  const parts: string[] = [];
  parts.push(`${adults} adult${adults === 1 ? '' : 's'}`);
  if (children > 0) {
    parts.push(`${children} child${children === 1 ? '' : 'ren'}`);
  }
  if (infants > 0) {
    parts.push(`${infants} infant${infants === 1 ? '' : 's'}`);
  }
  return parts.join(', ');
}

export function formatCabinLabel(cabin: CabinClass): string {
  switch (cabin) {
    case 'ECONOMY':
      return 'Economy';
    case 'PREMIUM_ECONOMY':
      return 'Premium Economy';
    case 'BUSINESS':
      return 'Business';
    case 'FIRST':
      return 'First';
    default:
      return cabin;
  }
}
