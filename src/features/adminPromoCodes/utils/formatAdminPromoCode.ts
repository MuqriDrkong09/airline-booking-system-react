import type { PromoCodeFormParsedValues } from '../schemas/promoCodeFormSchema';
import type { AdminPromoCode, AdminPromoCodeInput } from '../types/adminPromoCode';

export function toAdminPromoCodeInput(values: PromoCodeFormParsedValues): AdminPromoCodeInput {
  return {
    code: values.code,
    description: values.description,
    discountType: values.discountType,
    discountValue: values.discountValue,
    minimumBookingAmount: values.minimumBookingAmount,
    maximumDiscount: values.maximumDiscount,
    startDate: values.startDate,
    endDate: values.endDate,
    usageLimit: values.usageLimit,
    active: values.active,
  };
}

export function getActiveLabel(active: boolean): string {
  return active ? 'Active' : 'Inactive';
}

export function getDiscountTypeLabel(type: AdminPromoCode['discountType']): string {
  return type === 'PERCENT' ? 'Percentage' : 'Fixed amount';
}

export function formatDiscountValue(promo: AdminPromoCode): string {
  if (promo.discountType === 'PERCENT') {
    return `${promo.discountValue}%`;
  }
  return promo.discountValue.toFixed(2);
}

export function formatUsage(promo: AdminPromoCode): string {
  if (promo.usageLimit === null) {
    return `${promo.usedCount} / ∞`;
  }
  return `${promo.usedCount} / ${promo.usageLimit}`;
}

export function cloneAdminPromoCode(promo: AdminPromoCode): AdminPromoCode {
  return { ...promo };
}
