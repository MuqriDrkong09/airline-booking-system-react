import type { BaggageWeightKg } from '../constants/baggage';

export interface BaggagePassenger {
  id: string;
  type: 'ADULT' | 'CHILD' | 'INFANT';
  displayName: string;
}

/** Per-passenger baggage. `0` means none for checked or additional. */
export interface PassengerBaggageSelection {
  passengerId: string;
  cabinKg: BaggageWeightKg;
  checkedKg: 0 | BaggageWeightKg;
  additionalKg: 0 | BaggageWeightKg;
}

export interface BaggageLinePrice {
  passengerId: string;
  cabin: number;
  checked: number;
  additional: number;
  total: number;
}

export type BaggageSaveStatus = 'idle' | 'saved' | 'error';
