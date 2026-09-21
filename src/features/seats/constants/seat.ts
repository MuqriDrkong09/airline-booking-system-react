import type { SeatClass } from '../types/seat';

export const SEAT_STATUSES = [
  'AVAILABLE',
  'SELECTED',
  'OCCUPIED',
  'PREMIUM',
  'EMERGENCY_EXIT',
  'UNAVAILABLE',
] as const;

export type SeatStatus = (typeof SEAT_STATUSES)[number];

export const SEAT_FEATURES = [
  'WINDOW',
  'AISLE',
  'EXTRA_LEGROOM',
  'NEAR_GALLEY',
  'NEAR_LAVATORY',
  'BASSINET',
] as const;

export type SeatFeature = (typeof SEAT_FEATURES)[number];

export const SEAT_STATUS_LABELS: Readonly<Record<SeatStatus, string>> = {
  AVAILABLE: 'Available',
  SELECTED: 'Selected',
  OCCUPIED: 'Occupied',
  PREMIUM: 'Premium',
  EMERGENCY_EXIT: 'Emergency exit',
  UNAVAILABLE: 'Unavailable',
};

export const SEAT_CLASS_LABELS: Readonly<Record<SeatClass, string>> = {
  ECONOMY: 'Economy',
  PREMIUM_ECONOMY: 'Premium economy',
  BUSINESS: 'Business',
  FIRST: 'First class',
};

/** Visual tokens for seat states (light theme friendly). */
export const SEAT_STATUS_COLORS: Readonly<
  Record<SeatStatus, { bg: string; border: string; color: string }>
> = {
  AVAILABLE: { bg: '#FFFFFF', border: '#0B3D91', color: '#0B3D91' },
  SELECTED: { bg: '#0B3D91', border: '#0B3D91', color: '#FFFFFF' },
  OCCUPIED: { bg: '#D8E0EA', border: '#9AA6B2', color: '#5C6B7A' },
  PREMIUM: { bg: '#FFF8E6', border: '#C9A227', color: '#8F580F' },
  EMERGENCY_EXIT: { bg: '#E8F5EE', border: '#1B7F4E', color: '#125C38' },
  UNAVAILABLE: { bg: '#F4F7FB', border: '#D8E0EA', color: '#9AA6B2' },
};

export const SEAT_CLASS_BASE_PRICE: Readonly<Record<SeatClass, number>> = {
  ECONOMY: 0,
  PREMIUM_ECONOMY: 45,
  BUSINESS: 120,
  FIRST: 250,
};

export const ECONOMY_LAYOUT = ['A', 'B', 'C', '|', 'D', 'E', 'F'] as const;
export const PREMIUM_ECONOMY_LAYOUT = ['A', 'C', '|', 'D', 'F'] as const;
export const BUSINESS_LAYOUT = ['A', 'C', '|', 'D', 'F'] as const;
export const FIRST_LAYOUT = ['A', '|', 'F'] as const;
