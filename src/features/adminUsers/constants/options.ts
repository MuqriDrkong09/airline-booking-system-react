import type { AppSelectOption } from '@/components/common/AppSelect';
import { UserRole } from '@/types/auth';

export const ROLE_FILTER_OPTIONS: readonly AppSelectOption[] = [
  { value: '', label: 'All roles' },
  { value: UserRole.USER, label: 'Customer' },
  { value: UserRole.ADMIN, label: 'Administrator' },
];

export const ROLE_SELECT_OPTIONS: readonly AppSelectOption[] = [
  { value: UserRole.USER, label: 'Customer' },
  { value: UserRole.ADMIN, label: 'Administrator' },
];

export const ACTIVE_FILTER_OPTIONS: readonly AppSelectOption[] = [
  { value: '', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];
