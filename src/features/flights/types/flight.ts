import type { CabinClass } from './search';

export interface FlightAirline {
  code: string;
  name: string;
  /** Optional logo URL; UI falls back to airline code avatar when missing/broken. */
  logoUrl?: string;
}

export interface FlightEndpoint {
  code: string;
  city: string;
  airportName: string;
}

export interface FlightBaggage {
  cabinKg: number;
  checkedKg: number;
  pieces: number;
}

export interface FlightPriceAmount {
  amount: number;
  currency: string;
}

export interface FlightOffer {
  id: string;
  airline: FlightAirline;
  flightNumber: string;
  origin: FlightEndpoint;
  destination: FlightEndpoint;
  /** ISO local-ish datetime string: YYYY-MM-DDTHH:mm */
  departureTime: string;
  arrivalTime: string;
  durationMinutes: number;
  stops: number;
  stopAirports: string[];
  cabinClass: CabinClass;
  baggage: FlightBaggage;
  price: FlightPriceAmount;
  availableSeats: number;
  refundable: boolean;
  baggageIncluded: boolean;
}

export const FLIGHT_SORT_OPTIONS = [
  'recommended',
  'lowest_price',
  'shortest_duration',
  'earliest_departure',
  'latest_departure',
  'earliest_arrival',
] as const;

export type FlightSortOption = (typeof FLIGHT_SORT_OPTIONS)[number];

export const DEFAULT_FLIGHT_SORT: FlightSortOption = 'recommended';

export const FLIGHT_SORT_OPTION_LABELS: Record<FlightSortOption, string> = {
  recommended: 'Recommended',
  lowest_price: 'Lowest Price',
  shortest_duration: 'Shortest Duration',
  earliest_departure: 'Earliest Departure',
  latest_departure: 'Latest Departure',
  earliest_arrival: 'Earliest Arrival',
};

export function isFlightSortOption(value: string): value is FlightSortOption {
  return (FLIGHT_SORT_OPTIONS as readonly string[]).includes(value);
}

/** Minutes from midnight (0–1440). Null means unconstrained. */
export interface FlightFilterState {
  priceMin: number | null;
  priceMax: number | null;
  airlines: string[];
  stops: Array<0 | 1 | 2>;
  departureHourStart: number | null;
  departureHourEnd: number | null;
  arrivalHourStart: number | null;
  arrivalHourEnd: number | null;
  durationMax: number | null;
  cabinClasses: CabinClass[];
  refundableOnly: boolean;
  baggageIncludedOnly: boolean;
}

export interface FlightFilterBounds {
  priceMin: number;
  priceMax: number;
  durationMax: number;
}

export interface FlightSearchRequest {
  from: string;
  to: string;
  departure: string;
  returnDate?: string;
  adults: number;
  children: number;
  infants: number;
  cabinClass: CabinClass;
  tripType?: string;
}

export interface FlightSearchResponse {
  flights: FlightOffer[];
  currency: string;
  searchedAt: string;
}
