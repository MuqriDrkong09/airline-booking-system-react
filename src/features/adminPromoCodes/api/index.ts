import { adminApi } from '@/services/adminApi';
import type {
  AdminPromoCode,
  AdminPromoCodeFilters,
  AdminPromoCodeInput,
} from '../types/adminPromoCode';
import type { AdminPromoCodesApi } from './adminPromoCodesApi.types';

export const adminPromoCodesApi: AdminPromoCodesApi = adminApi.promoCodes;

export const adminPromoCodeKeys = {
  all: ['admin-promo-codes'] as const,
  lists: () => [...adminPromoCodeKeys.all, 'list'] as const,
  list: (filters?: AdminPromoCodeFilters) =>
    [...adminPromoCodeKeys.lists(), filters ?? {}] as const,
  details: () => [...adminPromoCodeKeys.all, 'detail'] as const,
  detail: (promoId: string) => [...adminPromoCodeKeys.details(), promoId] as const,
};

export function listAdminPromoCodes(
  filters?: AdminPromoCodeFilters,
): Promise<AdminPromoCode[]> {
  return adminPromoCodesApi.listPromoCodes(filters);
}

export function getAdminPromoCode(promoId: string): Promise<AdminPromoCode> {
  return adminPromoCodesApi.getPromoCode(promoId);
}

export function createAdminPromoCode(input: AdminPromoCodeInput): Promise<AdminPromoCode> {
  return adminPromoCodesApi.createPromoCode(input);
}

export function updateAdminPromoCode(
  promoId: string,
  input: AdminPromoCodeInput,
): Promise<AdminPromoCode> {
  return adminPromoCodesApi.updatePromoCode(promoId, input);
}

export function setAdminPromoCodeActive(
  promoId: string,
  active: boolean,
): Promise<AdminPromoCode> {
  return adminPromoCodesApi.setPromoCodeActive(promoId, active);
}

export function deleteAdminPromoCode(promoId: string): Promise<void> {
  return adminPromoCodesApi.deletePromoCode(promoId);
}

export type { AdminPromoCodesApi } from './adminPromoCodesApi.types';
export { createHttpAdminPromoCodesApi } from './httpAdminPromoCodesApi';
export {
  createMockAdminPromoCodesApi,
  mockAdminPromoCodesApi,
} from './mockAdminPromoCodesApi';
export { createSeedAdminPromoCodes } from './adminPromoCodesData';
