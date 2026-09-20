import type { CabinClass, TripType } from '../types/search';

export const TRIP_TYPE_OPTIONS: ReadonlyArray<{ value: TripType; label: string }> = [
  { value: 'ONE_WAY', label: 'One-way' },
  { value: 'ROUND_TRIP', label: 'Round-trip' },
  { value: 'MULTI_CITY', label: 'Multi-city' },
];

export const CABIN_CLASS_OPTIONS: ReadonlyArray<{ value: CabinClass; label: string }> = [
  { value: 'ECONOMY', label: 'Economy' },
  { value: 'PREMIUM_ECONOMY', label: 'Premium Economy' },
  { value: 'BUSINESS', label: 'Business' },
  { value: 'FIRST', label: 'First' },
];

export const MAX_PASSENGERS = 9;
export const MIN_ADULTS = 1;
export const MAX_MULTI_CITY_LEGS = 5;
export const MIN_MULTI_CITY_LEGS = 2;
