import type { CabinClass } from '@/features/flights';

/** Cabin classes used when preparing seat-map layouts. */
export type AircraftCabinClass = CabinClass;

/**
 * One cabin section in a future seat-map editor (nose → tail).
 * Column letters may include `|` aisle markers, matching `SeatRowModel.layout`.
 */
export interface AircraftSeatMapCabinSection {
  cabinClass: AircraftCabinClass;
  seatCount: number;
  columns: string[];
  /** 1-based starting row for this cabin. */
  startRow: number;
  rowCount: number;
}

/**
 * Prepared seat-map configuration for an aircraft type/tail.
 * Not edited in the admin UI yet — hydrated from seat counts on save.
 */
export interface AircraftSeatMapConfig {
  /** Lookup key for generators (typically `"Manufacturer Model"`). */
  layoutKey: string;
  cabins: AircraftSeatMapCabinSection[];
  notes?: string;
  version: number;
}

export interface AdminAircraft {
  id: string;
  manufacturer: string;
  model: string;
  registration: string;
  totalSeats: number;
  economySeats: number;
  premiumEconomySeats: number;
  businessSeats: number;
  firstClassSeats: number;
  active: boolean;
  /** Seat-map payload ready for a future configuration editor. */
  seatMapConfig: AircraftSeatMapConfig | null;
}

export type AdminAircraftInput = Omit<AdminAircraft, 'id'>;

export interface AdminAircraftFilters {
  search: string;
  manufacturer: string;
  active: '' | 'active' | 'inactive';
}

export const EMPTY_ADMIN_AIRCRAFT_FILTERS: AdminAircraftFilters = {
  search: '',
  manufacturer: '',
  active: '',
};
