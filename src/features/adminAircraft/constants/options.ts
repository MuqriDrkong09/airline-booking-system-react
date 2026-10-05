import type { AppSelectOption } from '@/components/common/AppSelect';
import { createSeedAdminAircraft } from '../api/adminAircraftData';

export const ACTIVE_FILTER_OPTIONS: readonly AppSelectOption[] = [
  { value: '', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

export const MANUFACTURER_FILTER_OPTIONS: readonly AppSelectOption[] = [
  { value: '', label: 'All manufacturers' },
  ...Array.from(new Set(createSeedAdminAircraft().map((aircraft) => aircraft.manufacturer)))
    .sort((left, right) => left.localeCompare(right))
    .map((manufacturer) => ({ value: manufacturer, label: manufacturer })),
];
