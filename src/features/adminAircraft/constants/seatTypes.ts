import type { AppSelectOption } from '@/components/common/AppSelect';
import { CABIN_CLASSES } from '@/features/flights';
import { ADMIN_SEAT_TYPE_VALUES, type AdminSeatType } from '../types/adminAircraft';

export const ADMIN_SEAT_TYPES = ADMIN_SEAT_TYPE_VALUES;

export const ADMIN_SEAT_TYPE_LABELS: Readonly<Record<AdminSeatType, string>> = {
  STANDARD: 'Standard',
  PREMIUM: 'Premium',
  EXTRA_LEGROOM: 'Extra legroom',
  EMERGENCY_EXIT: 'Emergency exit',
  UNAVAILABLE: 'Unavailable',
};

export const ADMIN_SEAT_TYPE_COLORS: Readonly<
  Record<AdminSeatType, { bg: string; border: string; color: string }>
> = {
  STANDARD: { bg: '#FFFFFF', border: '#0B3D91', color: '#0B3D91' },
  PREMIUM: { bg: '#FFF8E6', border: '#C9A227', color: '#8F580F' },
  EXTRA_LEGROOM: { bg: '#E8F1FF', border: '#3B6FD9', color: '#1E3F8F' },
  EMERGENCY_EXIT: { bg: '#E8F5EE', border: '#1B7F4E', color: '#125C38' },
  UNAVAILABLE: { bg: '#F4F7FB', border: '#D8E0EA', color: '#9AA6B2' },
};

export const ADMIN_SEAT_TYPE_OPTIONS: readonly AppSelectOption[] = ADMIN_SEAT_TYPES.map(
  (value) => ({
    value,
    label: ADMIN_SEAT_TYPE_LABELS[value],
  }),
);

export const CABIN_CLASS_OPTIONS: readonly AppSelectOption[] = CABIN_CLASSES.map((value) => ({
  value,
  label: value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' '),
}));

export const DEFAULT_COLUMN_LAYOUT = ['A', 'B', 'C', '|', 'D', 'E', 'F'] as const;
