import type { AppSelectOption } from '@/components/common/AppSelect';
import { BOOKING_RECORD_STATUSES, BOOKING_STATUS_LABELS } from '@/features/booking';
import type { AdminBookingSortField } from '../types/adminBooking';

export const STATUS_FILTER_OPTIONS: readonly AppSelectOption[] = [
  { value: '', label: 'All statuses' },
  ...BOOKING_RECORD_STATUSES.map((status) => ({
    value: status,
    label: BOOKING_STATUS_LABELS[status],
  })),
];

export const SORT_FIELD_OPTIONS: readonly {
  value: AdminBookingSortField;
  label: string;
}[] = [
  { value: 'createdAt', label: 'Created' },
  { value: 'departure', label: 'Departure' },
  { value: 'reference', label: 'Reference' },
  { value: 'flight', label: 'Flight' },
  { value: 'status', label: 'Status' },
  { value: 'total', label: 'Total' },
] as const;
