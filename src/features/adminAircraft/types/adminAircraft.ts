import type { CabinClass } from '@/features/flights';

/** Cabin classes used when preparing seat-map layouts. */
export type AircraftCabinClass = CabinClass;

/**
 * Admin-configurable seat kinds for the seat-map editor.
 * Distinct from customer booking `SeatStatus` / `SeatFeature`.
 */
export const ADMIN_SEAT_TYPE_VALUES = [
  'STANDARD',
  'PREMIUM',
  'EXTRA_LEGROOM',
  'EMERGENCY_EXIT',
  'UNAVAILABLE',
] as const;

export type AdminSeatType = (typeof ADMIN_SEAT_TYPE_VALUES)[number];

/**
 * One cabin section (nose → tail).
 * Column letters may include `|` aisle markers.
 */
export interface AircraftSeatMapCabinSection {
  cabinClass: AircraftCabinClass;
  seatCount: number;
  columns: string[];
  /** 1-based starting row for this cabin. */
  startRow: number;
  rowCount: number;
}

/** Fully configured seat cell in the admin seat-map editor. */
export interface AircraftConfiguredSeat {
  id: string;
  row: number;
  column: string;
  label: string;
  cabinClass: AircraftCabinClass;
  seatType: AdminSeatType;
  price: number;
  emergencyExit: boolean;
  disabled: boolean;
}

/**
 * Seat-map configuration for an aircraft type/tail.
 * Geometry (`rows` / `columns`) plus per-seat overrides.
 */
export interface AircraftSeatMapConfig {
  /** Lookup key for generators (typically `"Manufacturer Model"`). */
  layoutKey: string;
  /** Total row count in the map (1-based rows `1..rows`). */
  rows: number;
  /** Column letters with optional `|` aisle markers. */
  columns: string[];
  /** Cabin summaries derived from / aligned with configured seats. */
  cabins: AircraftSeatMapCabinSection[];
  /** Interactive editor seat cells. */
  seats: AircraftConfiguredSeat[];
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
  /** Seat-map payload edited on `/admin/aircraft/:id/seats`. */
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
