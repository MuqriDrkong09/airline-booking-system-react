import type { FlightOperationalStatus } from '@/features/flights';
import type {
  AdminFlight,
  AdminFlightFilters,
  AdminFlightInput,
} from '../types/adminFlight';

export interface AdminFlightsApi {
  listFlights: (filters?: AdminFlightFilters) => Promise<AdminFlight[]>;
  getFlight: (flightId: string) => Promise<AdminFlight>;
  createFlight: (input: AdminFlightInput) => Promise<AdminFlight>;
  updateFlight: (flightId: string, input: AdminFlightInput) => Promise<AdminFlight>;
  updateFlightStatus: (
    flightId: string,
    status: FlightOperationalStatus,
  ) => Promise<AdminFlight>;
  deleteFlight: (flightId: string) => Promise<void>;
}
