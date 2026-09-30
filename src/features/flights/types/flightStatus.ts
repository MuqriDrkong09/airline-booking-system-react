import type { FlightAirline, FlightEndpoint } from './flight';

export const FLIGHT_OPERATIONAL_STATUSES = [
  'SCHEDULED',
  'BOARDING',
  'DELAYED',
  'DEPARTED',
  'ARRIVED',
  'CANCELLED',
] as const;

export type FlightOperationalStatus = (typeof FLIGHT_OPERATIONAL_STATUSES)[number];

export const FLIGHT_OPERATIONAL_STATUS_LABELS: Record<FlightOperationalStatus, string> = {
  SCHEDULED: 'Scheduled',
  BOARDING: 'Boarding',
  DELAYED: 'Delayed',
  DEPARTED: 'Departed',
  ARRIVED: 'Arrived',
  CANCELLED: 'Cancelled',
};

export function isFlightOperationalStatus(value: string): value is FlightOperationalStatus {
  return (FLIGHT_OPERATIONAL_STATUSES as readonly string[]).includes(value);
}

export interface FlightStatusLookupRequest {
  flightNumber: string;
  /** Departure calendar date `YYYY-MM-DD`. */
  date: string;
}

export interface FlightStatusRecord {
  flightNumber: string;
  airline: FlightAirline;
  origin: FlightEndpoint;
  destination: FlightEndpoint;
  /** Local `YYYY-MM-DDTHH:mm` */
  scheduledDeparture: string;
  /** Local `YYYY-MM-DDTHH:mm` — may differ when delayed. */
  estimatedDeparture: string;
  scheduledArrival: string;
  estimatedArrival: string;
  terminal: string;
  gate: string;
  status: FlightOperationalStatus;
  /** Date used for the lookup. */
  date: string;
}
