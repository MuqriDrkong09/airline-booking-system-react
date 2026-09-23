import { env } from '@/config/env';
import type { PromoValidateRequest, PromoValidationResult } from '../types/promo';
import { createHttpPromoApi } from './httpPromoApi';
import { mockPromoApi } from './mockPromoApi';
import type { PromoApi } from './promoApi.types';

export const promoApi: PromoApi = env.useMockAuth
  ? mockPromoApi
  : createHttpPromoApi();

export const promoKeys = {
  all: ['promo'] as const,
  validations: () => [...promoKeys.all, 'validate'] as const,
  validate: (request: Pick<PromoValidateRequest, 'code' | 'subtotal' | 'currency'>) =>
    [...promoKeys.validations(), request] as const,
};

export function validatePromoCodeRequest(
  request: PromoValidateRequest,
): Promise<PromoValidationResult> {
  return promoApi.validatePromoCode(request);
}

export type { PromoApi } from './promoApi.types';
export { createHttpPromoApi } from './httpPromoApi';
export { createMockPromoApi, mockPromoApi } from './mockPromoApi';
