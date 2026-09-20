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
  /** Departure or arrival terminal when known. */
  terminal?: string;
}

export interface FlightAircraft {
  model: string;
  registration?: string;
}

export interface FlightBaggage {
  cabinKg: number;
  checkedKg: number;
  pieces: number;
  /** Human-readable allowance summary for details views. */
  allowanceSummary?: string;
}

export interface FlightAmenities {
  meals: string;
  wifi: boolean;
  wifiNotes: string;
  seatInformation: string;
}

export interface FlightFarePolicies {
  refundPolicy: string;
  changePolicy: string;
  fareConditions: string[];
}

export interface FlightOfferSegment {
  id: string;
  flightNumber: string;
  airline: FlightAirline;
  aircraft: FlightAircraft;
  origin: FlightEndpoint;
  destination: FlightEndpoint;
  /** ISO local-ish datetime string: YYYY-MM-DDTHH:mm */
  departureTime: string;
  arrivalTime: string;
  durationMinutes: number;
}

export interface FlightPriceAmount {
  amount: number;
  currency: string;
}

export interface FlightOffer {
  id: string;
  airline: FlightAirline;
  flightNumber: string;
  aircraft: FlightAircraft;
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
  amenities: FlightAmenities;
  policies: FlightFarePolicies;
  segments: FlightOfferSegment[];
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
