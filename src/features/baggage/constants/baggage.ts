import type { CabinClass } from '@/features/flights';

export const BAGGAGE_WEIGHTS_KG = [7, 20, 30, 40] as const;
export type BaggageWeightKg = (typeof BAGGAGE_WEIGHTS_KG)[number];

export const BAGGAGE_TYPES = ['CABIN', 'CHECKED', 'ADDITIONAL'] as const;
export type BaggageType = (typeof BAGGAGE_TYPES)[number];

export const BAGGAGE_TYPE_LABELS: Readonly<Record<BaggageType, string>> = {
  CABIN: 'Cabin baggage',
  CHECKED: 'Checked baggage',
  ADDITIONAL: 'Additional baggage',
};

/** Price for a bag of this weight when it is not covered by the fare allowance. */
export const BAGGAGE_WEIGHT_PRICE_USD: Readonly<Record<BaggageWeightKg, number>> = {
  7: 15,
  20: 35,
  30: 55,
  40: 80,
};

export interface BaggageAllowance {
  cabinKg: BaggageWeightKg;
  checkedKg: 0 | BaggageWeightKg;
}

export const CABIN_BAGGAGE_ALLOWANCE: Readonly<Record<CabinClass, BaggageAllowance>> = {
  ECONOMY: { cabinKg: 7, checkedKg: 20 },
  PREMIUM_ECONOMY: { cabinKg: 7, checkedKg: 30 },
  BUSINESS: { cabinKg: 7, checkedKg: 40 },
  FIRST: { cabinKg: 7, checkedKg: 40 },
};

export function formatBaggageWeight(kg: number): string {
  return `${kg}KG`;
}
