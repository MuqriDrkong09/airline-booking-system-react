import type { BookingPromoCode } from '@/features/booking';
import { roundMoney } from '@/features/booking';
import {
  formatPromoAmount,
  getPromoDefinition,
  normalizePromoCode,
  PROMO_CODE_CATALOG,
} from '../constants/promoCodes';
import type {
  AppliedPromoCode,
  PromoCodeDefinition,
  PromoValidateRequest,
  PromoValidationResult,
} from '../types/promo';

function todayIso(asOfDate?: string): string {
  if (asOfDate?.trim()) {
    return asOfDate.trim().slice(0, 10);
  }
  return new Date().toISOString().slice(0, 10);
}

export function isPromoExpired(
  promo: PromoCodeDefinition,
  asOfDate?: string,
): boolean {
  if (!promo.expiresAt) {
    return false;
  }
  return todayIso(asOfDate) > promo.expiresAt;
}

export function computePromoDiscountAmount(
  subtotal: number,
  promo: Pick<PromoCodeDefinition, 'discountType' | 'discountValue' | 'maxDiscount'>,
): number {
  if (subtotal <= 0) {
    return 0;
  }

  let discount: number;
  if (promo.discountType === 'PERCENT') {
    const percent = Math.min(Math.max(promo.discountValue, 0), 100);
    discount = (subtotal * percent) / 100;
  } else {
    discount = Math.max(promo.discountValue, 0);
  }

  if (typeof promo.maxDiscount === 'number' && promo.maxDiscount >= 0) {
    discount = Math.min(discount, promo.maxDiscount);
  }

  return roundMoney(Math.min(discount, subtotal));
}

export function toBookingPromoCode(promo: AppliedPromoCode): BookingPromoCode {
  return {
    code: promo.code,
    discountType: promo.discountType,
    discountValue: promo.discountValue,
    maxDiscount: promo.maxDiscount,
    currency: promo.currency,
    description: promo.description,
  };
}

export function validatePromoCode(
  request: PromoValidateRequest,
  catalog: readonly PromoCodeDefinition[] = PROMO_CODE_CATALOG,
): PromoValidationResult {
  const normalized = normalizePromoCode(request.code);
  if (!normalized) {
    return {
      ok: false,
      status: 'INVALID',
      message: 'Enter a promo code to apply.',
    };
  }

  const definition = getPromoDefinition(normalized, catalog);
  if (!definition) {
    return {
      ok: false,
      status: 'INVALID',
      message: `Promo code “${normalized}” is not valid.`,
    };
  }

  if (isPromoExpired(definition, request.asOfDate)) {
    return {
      ok: false,
      status: 'EXPIRED',
      message: `Promo code “${definition.code}” has expired.`,
      currency: definition.currency,
    };
  }

  const subtotal = Math.max(0, request.subtotal);
  if (subtotal < definition.minBookingAmount) {
    return {
      ok: false,
      status: 'BELOW_MINIMUM',
      message: `Promo code “${definition.code}” requires a minimum booking of ${formatPromoAmount(
        definition.minBookingAmount,
        definition.currency,
      )}.`,
      minBookingAmount: definition.minBookingAmount,
      currency: definition.currency,
    };
  }

  const discountAmount = computePromoDiscountAmount(subtotal, definition);
  const promo: AppliedPromoCode = {
    code: definition.code,
    discountType: definition.discountType,
    discountValue: definition.discountValue,
    maxDiscount: definition.maxDiscount,
    currency: definition.currency,
    description: definition.description,
    discountAmount,
  };

  return {
    ok: true,
    status: 'VALID',
    promo,
    message: `${definition.description} applied — you save ${formatPromoAmount(
      discountAmount,
      definition.currency,
    )}.`,
  };
}
