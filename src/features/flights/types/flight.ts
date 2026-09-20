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

export type FlightSortOption = 'price_asc' | 'price_desc' | 'duration_asc' | 'departure_asc' | 'arrival_asc';

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
