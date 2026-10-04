import type { Airport } from '@/features/flights';

/** Admin airport entity — same shape as customer `Airport`. */
export type AdminAirport = Airport;

export type AdminAirportInput = Omit<AdminAirport, 'id'>;

export interface AdminAirportFilters {
  search: string;
  country: string;
  active: '' | 'active' | 'inactive';
}

export const EMPTY_ADMIN_AIRPORT_FILTERS: AdminAirportFilters = {
  search: '',
  country: '',
  active: '',
};
