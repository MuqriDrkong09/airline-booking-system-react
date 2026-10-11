import { PROMO_CODE_CATALOG } from '../constants/promoCodes';
import type { PromoValidateRequest, PromoValidationResult } from '../types/promo';
import { validatePromoCode } from '../utils/promoRules';
import type { PromoApi } from './promoApi.types';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

const DEFAULT_LATENCY_MS = process.env.NODE_ENV === 'test' ? 0 : 280;

export function createMockPromoApi(options?: {
  latencyMs?: number;
}): PromoApi {
  const latencyMs = options?.latencyMs ?? DEFAULT_LATENCY_MS;

  return {
    async validatePromoCode(request: PromoValidateRequest): Promise<PromoValidationResult> {
      await delay(latencyMs);
      return validatePromoCode(request, PROMO_CODE_CATALOG);
    },
  };
}

export const mockPromoApi = createMockPromoApi();
