export const PROMO_DISCOUNT_TYPES = ['PERCENT', 'FIXED'] as const;
export type PromoDiscountType = (typeof PROMO_DISCOUNT_TYPES)[number];

export const PROMO_VALIDATION_STATUSES = [
  'VALID',
  'INVALID',
  'EXPIRED',
  'BELOW_MINIMUM',
] as const;

export type PromoValidationStatus = (typeof PROMO_VALIDATION_STATUSES)[number];

/** Catalog definition used by mock / API validation. */
export interface PromoCodeDefinition {
  code: string;
  discountType: PromoDiscountType;
  discountValue: number;
  currency: string;
  /** Cap on computed discount; null means uncapped. */
  maxDiscount: number | null;
  /** Subtotal must be at least this amount. */
  minBookingAmount: number;
  /** Inclusive end-of-day ISO date (YYYY-MM-DD); null means no expiry. */
  expiresAt: string | null;
  description: string;
}

export interface PromoValidateRequest {
  code: string;
  /** Booking subtotal before discount (same currency as booking). */
  subtotal: number;
  currency: string;
  /** Optional “today” override for tests. */
  asOfDate?: string;
}

export interface AppliedPromoCode {
  code: string;
  discountType: PromoDiscountType;
  discountValue: number;
  maxDiscount: number | null;
  currency: string;
  description: string;
  /** Discount amount applied to the current subtotal. */
  discountAmount: number;
}

export type PromoValidationResult =
  | {
      ok: true;
      status: 'VALID';
      promo: AppliedPromoCode;
      message: string;
    }
  | {
      ok: false;
      status: Exclude<PromoValidationStatus, 'VALID'>;
      message: string;
      minBookingAmount?: number;
      currency?: string;
    };
