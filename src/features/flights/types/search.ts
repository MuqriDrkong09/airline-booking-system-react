import type { Airport } from './airport';

export const TRIP_TYPES = ['ONE_WAY', 'ROUND_TRIP', 'MULTI_CITY'] as const;
export type TripType = (typeof TRIP_TYPES)[number];

export const CABIN_CLASSES = [
  'ECONOMY',
  'PREMIUM_ECONOMY',
  'BUSINESS',
  'FIRST',
] as const;
export type CabinClass = (typeof CABIN_CLASSES)[number];

export interface FlightLegValues {
  origin: Airport | null;
  destination: Airport | null;
  departureDate: string;
}

export interface FlightSearchFormValues {
  tripType: TripType;
  origin: Airport | null;
  destination: Airport | null;
  departureDate: string;
  returnDate: string;
  adults: number;
  children: number;
  infants: number;
  cabinClass: CabinClass;
  legs: FlightLegValues[];
}

/** Serializable search criteria (airport codes) for URL sharing. */
export interface FlightSearchCriteria {
  tripType: TripType;
  from: string;
  to: string;
  departure: string;
  returnDate?: string;
  adults: number;
  children: number;
  infants: number;
  cabinClass: CabinClass;
  legs?: Array<{ from: string; to: string; departure: string }>;
}
