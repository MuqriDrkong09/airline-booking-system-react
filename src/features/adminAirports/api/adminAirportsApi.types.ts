import type {
  AdminAirport,
  AdminAirportFilters,
  AdminAirportInput,
} from '../types/adminAirport';

export interface AdminAirportsApi {
  listAirports: (filters?: AdminAirportFilters) => Promise<AdminAirport[]>;
  getAirport: (airportId: string) => Promise<AdminAirport>;
  createAirport: (input: AdminAirportInput) => Promise<AdminAirport>;
  updateAirport: (airportId: string, input: AdminAirportInput) => Promise<AdminAirport>;
  setAirportActive: (airportId: string, active: boolean) => Promise<AdminAirport>;
  deleteAirport: (airportId: string) => Promise<void>;
}
