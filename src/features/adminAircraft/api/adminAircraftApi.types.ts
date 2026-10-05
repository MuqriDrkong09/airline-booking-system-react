import type {
  AdminAircraft,
  AdminAircraftFilters,
  AdminAircraftInput,
} from '../types/adminAircraft';

export interface AdminAircraftApi {
  listAircraft: (filters?: AdminAircraftFilters) => Promise<AdminAircraft[]>;
  getAircraft: (aircraftId: string) => Promise<AdminAircraft>;
  createAircraft: (input: AdminAircraftInput) => Promise<AdminAircraft>;
  updateAircraft: (aircraftId: string, input: AdminAircraftInput) => Promise<AdminAircraft>;
  setAircraftActive: (aircraftId: string, active: boolean) => Promise<AdminAircraft>;
  deleteAircraft: (aircraftId: string) => Promise<void>;
}
