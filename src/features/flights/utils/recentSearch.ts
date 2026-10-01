import type { FlightSearchCriteria, FlightSearchFormValues } from '../types/search';
import type { RecentFlightSearch } from '../types/recentSearch';
import { formatCabinLabel, formatPassengerSummary } from './searchParams';

export function createRecentSearchId(): string {
  return `search-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function recentSearchFingerprint(search: Pick<
  RecentFlightSearch,
  | 'origin'
  | 'destination'
  | 'departureDate'
  | 'returnDate'
  | 'passengerCount'
  | 'cabinClass'
  | 'adults'
  | 'children'
  | 'infants'
>): string {
  return [
    search.origin,
    search.destination,
    search.departureDate,
    search.returnDate ?? '',
    search.adults,
    search.children,
    search.infants,
    search.cabinClass,
  ].join('|');
}

export function recentSearchFromFormValues(
  values: FlightSearchFormValues,
  timestamp = new Date().toISOString(),
): RecentFlightSearch | null {
  const adults = values.adults;
  const children = values.children;
  const infants = values.infants;
  const passengerCount = adults + children + infants;

  if (values.tripType === 'MULTI_CITY') {
    const firstLeg = values.legs.find(
      (leg) => leg.origin?.code && leg.destination?.code && leg.departureDate,
    );
    if (!firstLeg?.origin || !firstLeg.destination) {
      return null;
    }

    return {
      id: createRecentSearchId(),
      origin: firstLeg.origin.code,
      destination: firstLeg.destination.code,
      departureDate: firstLeg.departureDate,
      returnDate: null,
      passengerCount,
      adults,
      children,
      infants,
      cabinClass: values.cabinClass,
      timestamp,
    };
  }

  if (!values.origin?.code || !values.destination?.code || !values.departureDate) {
    return null;
  }

  return {
    id: createRecentSearchId(),
    origin: values.origin.code,
    destination: values.destination.code,
    departureDate: values.departureDate,
    returnDate:
      values.tripType === 'ROUND_TRIP' && values.returnDate ? values.returnDate : null,
    passengerCount,
    adults,
    children,
    infants,
    cabinClass: values.cabinClass,
    timestamp,
  };
}

export function criteriaFromRecentSearch(search: RecentFlightSearch): FlightSearchCriteria {
  const tripType = search.returnDate ? 'ROUND_TRIP' : 'ONE_WAY';

  return {
    tripType,
    from: search.origin,
    to: search.destination,
    departure: search.departureDate,
    returnDate: search.returnDate ?? undefined,
    adults: Math.max(1, search.adults),
    children: Math.max(0, search.children),
    infants: Math.max(0, search.infants),
    cabinClass: search.cabinClass,
  };
}

export function formatRecentSearchRoute(search: RecentFlightSearch): string {
  return `${search.origin} → ${search.destination}`;
}

export function formatRecentSearchDates(search: RecentFlightSearch): string {
  if (search.returnDate) {
    return `${search.departureDate} → ${search.returnDate}`;
  }
  return search.departureDate;
}

export function formatRecentSearchMeta(search: RecentFlightSearch): string {
  return `${formatPassengerSummary(search.adults, search.children, search.infants)} · ${formatCabinLabel(search.cabinClass)}`;
}

export function prependRecentSearch(
  history: RecentFlightSearch[],
  entry: RecentFlightSearch,
  limit: number,
): RecentFlightSearch[] {
  const fingerprint = recentSearchFingerprint(entry);
  const withoutDuplicate = history.filter(
    (item) => recentSearchFingerprint(item) !== fingerprint,
  );
  return [entry, ...withoutDuplicate].slice(0, limit);
}
