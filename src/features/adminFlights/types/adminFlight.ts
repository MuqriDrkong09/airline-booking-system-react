import {
  CABIN_CLASSES,
  FLIGHT_OPERATIONAL_STATUSES,
  type CabinClass,
  type FlightOperationalStatus,
} from '@/features/flights';

export interface AdminFlight {
  id: string;
  airline: string;
  flightNumber: string;
  origin: string;
  destination: string;
  aircraft: string;
  /** Local `YYYY-MM-DDTHH:mm` */
  departure: string;
  /** Local `YYYY-MM-DDTHH:mm` */
  arrival: string;
  terminal: string;
  gate: string;
  status: FlightOperationalStatus;
  availableSeats: number;
  fareClasses: CabinClass[];
  createdAt: string;
  updatedAt: string;
}

export type AdminFlightInput = Omit<AdminFlight, 'id' | 'createdAt' | 'updatedAt'>;

export interface AdminFlightFilters {
  search: string;
  airline: string;
  origin: string;
  destination: string;
  status: string;
}

export const EMPTY_ADMIN_FLIGHT_FILTERS: AdminFlightFilters = {
  search: '',
  airline: '',
  origin: '',
  destination: '',
  status: '',
};

export const ADMIN_FLIGHT_STATUSES = FLIGHT_OPERATIONAL_STATUSES;
export const ADMIN_FARE_CLASSES = CABIN_CLASSES;
