import type { PromoCodeDefinition } from '../types/promo';

/**
 * Demo catalog — FLIGHT100 is the primary example (RM100 fixed discount).
 */
export const PROMO_CODE_CATALOG: readonly PromoCodeDefinition[] = [
  {
    code: 'FLIGHT100',
    discountType: 'FIXED',
    discountValue: 100,
    currency: 'MYR',
    maxDiscount: null,
    minBookingAmount: 150,
    expiresAt: '2099-12-31',
    description: 'RM100 discount',
  },
  {
    code: 'SAVE15',
    discountType: 'PERCENT',
    discountValue: 15,
    currency: 'USD',
    maxDiscount: 80,
    minBookingAmount: 100,
    expiresAt: '2099-12-31',
    description: '15% off (max $80)',
  },
  {
    code: 'FLAT50',
    discountType: 'FIXED',
    discountValue: 50,
    currency: 'USD',
    maxDiscount: null,
    minBookingAmount: 0,
    expiresAt: '2099-12-31',
    description: '$50 off your booking',
  },
  {
    code: 'BIGSPEND',
    discountType: 'FIXED',
    discountValue: 75,
    currency: 'USD',
    maxDiscount: null,
    minBookingAmount: 500,
    expiresAt: '2099-12-31',
    description: '$75 off bookings of $500+',
  },
  {
    code: 'EXPIRED10',
    discountType: 'PERCENT',
    discountValue: 10,
    currency: 'USD',
    maxDiscount: 40,
    minBookingAmount: 0,
    expiresAt: '2020-01-01',
    description: 'Expired 10% promo',
  },
] as const;

export function normalizePromoCode(code: string): string {
  return code.trim().toUpperCase();
}

export function getPromoDefinition(
  code: string,
  catalog: readonly PromoCodeDefinition[] = PROMO_CODE_CATALOG,
): PromoCodeDefinition | undefined {
  const normalized = normalizePromoCode(code);
  return catalog.find((promo) => promo.code === normalized);
}

/** Display discount amounts; MYR uses the RM prefix from the brief. */
export function formatPromoAmount(amount: number, currency: string): string {
  if (currency === 'MYR') {
    const rounded = Math.round((amount + Number.EPSILON) * 100) / 100;
    return Number.isInteger(rounded) ? `RM${rounded}` : `RM${rounded.toFixed(2)}`;
  }

  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}
