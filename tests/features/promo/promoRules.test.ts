import {
  computePromoDiscountAmount,
  formatPromoAmount,
  isPromoExpired,
  validatePromoCode,
  type PromoCodeDefinition,
} from '@/features/promo';

const basePromo: PromoCodeDefinition = {
  code: 'TEST',
  discountType: 'FIXED',
  discountValue: 100,
  currency: 'MYR',
  maxDiscount: null,
  minBookingAmount: 150,
  expiresAt: '2099-12-31',
  description: 'RM100 discount',
};

describe('promoRules', () => {
  it('applies FLIGHT100 as an RM100 fixed discount when valid', () => {
    const result = validatePromoCode({
      code: 'flight100',
      subtotal: 400,
      currency: 'MYR',
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.promo.code).toBe('FLIGHT100');
    expect(result.promo.discountAmount).toBe(100);
    expect(result.promo.description).toBe('RM100 discount');
    expect(result.message).toContain('RM100');
  });

  it('rejects unknown codes as invalid', () => {
    const result = validatePromoCode({
      code: 'NOPE',
      subtotal: 500,
      currency: 'USD',
    });

    expect(result).toMatchObject({
      ok: false,
      status: 'INVALID',
    });
  });

  it('rejects expired codes', () => {
    const result = validatePromoCode({
      code: 'EXPIRED10',
      subtotal: 500,
      currency: 'USD',
      asOfDate: '2026-01-01',
    });

    expect(result).toMatchObject({
      ok: false,
      status: 'EXPIRED',
    });
  });

  it('enforces minimum booking amount', () => {
    const result = validatePromoCode({
      code: 'BIGSPEND',
      subtotal: 200,
      currency: 'USD',
    });

    expect(result).toMatchObject({
      ok: false,
      status: 'BELOW_MINIMUM',
      minBookingAmount: 500,
    });
  });

  it('caps percentage discounts with maximum discount', () => {
    const amount = computePromoDiscountAmount(1000, {
      discountType: 'PERCENT',
      discountValue: 15,
      maxDiscount: 80,
    });
    expect(amount).toBe(80);
  });

  it('formats MYR amounts with an RM prefix', () => {
    expect(formatPromoAmount(100, 'MYR')).toBe('RM100');
  });

  it('detects expiry against as-of date', () => {
    expect(isPromoExpired({ ...basePromo, expiresAt: '2020-01-01' }, '2021-01-01')).toBe(
      true,
    );
    expect(isPromoExpired({ ...basePromo, expiresAt: '2099-12-31' }, '2026-01-01')).toBe(
      false,
    );
  });
});
