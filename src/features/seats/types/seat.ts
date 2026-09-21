import type { CabinClass } from '@/features/flights';
import type { SeatFeature, SeatStatus } from '../constants/seat';

export type SeatClass = CabinClass;

export interface Seat {
  id: string;
  row: number;
  column: string;
  label: string;
  class: SeatClass;
  price: number;
  status: SeatStatus;
  features: SeatFeature[];
}

export interface SeatRowModel {
  row: number;
  class: SeatClass;
  seats: Seat[];
  /** Column letters with `|` markers for aisles, e.g. `['A','B','C','|','D','E','F']`. */
  layout: string[];
}

export interface SeatMapModel {
  aircraftModel: string;
  rows: SeatRowModel[];
  seats: Seat[];
}

export interface SeatPassenger {
  id: string;
  type: 'ADULT' | 'CHILD' | 'INFANT';
  firstName: string;
  lastName: string;
  displayName: string;
}

export interface SeatAssignment {
  passengerId: string;
  seatId: string;
}

export type SeatSelectionSaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface SeatSelectionContext {
  flightId: string;
  aircraftModel: string;
}
