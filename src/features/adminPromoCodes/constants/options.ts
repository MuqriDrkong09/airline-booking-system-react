import type { AppSelectOption } from '@/components/common/AppSelect';
import { PROMO_DISCOUNT_TYPES } from '@/features/promo';

export const DISCOUNT_TYPE_FILTER_OPTIONS: readonly AppSelectOption[] = [
  { value: '', label: 'All discount types' },
  { value: 'PERCENT', label: 'Percentage' },
  { value: 'FIXED', label: 'Fixed amount' },
];

export const DISCOUNT_TYPE_FORM_OPTIONS: readonly AppSelectOption[] = PROMO_DISCOUNT_TYPES.map(
  (type) => ({
    value: type,
    label: type === 'PERCENT' ? 'Percentage' : 'Fixed amount',
  }),
);

export const ACTIVE_FILTER_OPTIONS: readonly AppSelectOption[] = [
  { value: '', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];
