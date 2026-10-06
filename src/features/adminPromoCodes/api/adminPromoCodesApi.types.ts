import type {
  AdminPromoCode,
  AdminPromoCodeFilters,
  AdminPromoCodeInput,
} from '../types/adminPromoCode';

export interface AdminPromoCodesApi {
  listPromoCodes: (filters?: AdminPromoCodeFilters) => Promise<AdminPromoCode[]>;
  getPromoCode: (promoId: string) => Promise<AdminPromoCode>;
  createPromoCode: (input: AdminPromoCodeInput) => Promise<AdminPromoCode>;
  updatePromoCode: (promoId: string, input: AdminPromoCodeInput) => Promise<AdminPromoCode>;
  setPromoCodeActive: (promoId: string, active: boolean) => Promise<AdminPromoCode>;
  deletePromoCode: (promoId: string) => Promise<void>;
}
