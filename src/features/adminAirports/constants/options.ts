import type { AppSelectOption } from '@/components/common/AppSelect';
import { MOCK_AIRPORTS } from '@/features/flights';

export const ACTIVE_FILTER_OPTIONS: readonly AppSelectOption[] = [
  { value: '', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

export const COUNTRY_FILTER_OPTIONS: readonly AppSelectOption[] = [
  { value: '', label: 'All countries' },
  ...Array.from(new Set(MOCK_AIRPORTS.map((airport) => airport.country)))
    .sort((left, right) => left.localeCompare(right))
    .map((country) => ({ value: country, label: country })),
];
