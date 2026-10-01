import type { CabinClass } from '../types/search';

export const RECENT_SEARCH_HISTORY_LIMIT = 10;

export interface RecentFlightSearch {
  id: string;
  origin: string;
  destination: string;
  departureDate: string;
  returnDate: string | null;
  passengerCount: number;
  /** Kept for accurate search replay alongside passengerCount. */
  adults: number;
  children: number;
  infants: number;
  cabinClass: CabinClass;
  timestamp: string;
}
