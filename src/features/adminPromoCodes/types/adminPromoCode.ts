import type { PromoDiscountType } from '@/features/promo';

export interface AdminPromoCode {
  id: string;
  code: string;
  description: string;
  discountType: PromoDiscountType;
  discountValue: number;
  minimumBookingAmount: number;
  /** Null means uncapped. */
  maximumDiscount: number | null;
  /** Inclusive start date `YYYY-MM-DD`. */
  startDate: string;
  /** Inclusive end date `YYYY-MM-DD`. */
  endDate: string;
  /** Null means unlimited uses. */
  usageLimit: number | null;
  usedCount: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export type AdminPromoCodeInput = Omit<
  AdminPromoCode,
  'id' | 'usedCount' | 'createdAt' | 'updatedAt'
>;

export interface AdminPromoCodeFilters {
  search: string;
  discountType: '' | PromoDiscountType;
  active: '' | 'active' | 'inactive';
}

export const EMPTY_ADMIN_PROMO_CODE_FILTERS: AdminPromoCodeFilters = {
  search: '',
  discountType: '',
  active: '',
};
