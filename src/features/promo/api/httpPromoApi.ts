import { apiClient } from '@/services/api';
import type { PromoValidateRequest, PromoValidationResult } from '../types/promo';
import type { PromoApi } from './promoApi.types';

export function createHttpPromoApi(): PromoApi {
  return {
    async validatePromoCode(request: PromoValidateRequest): Promise<PromoValidationResult> {
      const { data } = await apiClient.post<PromoValidationResult>('/promo-codes/validate', {
        code: request.code,
        subtotal: request.subtotal,
        currency: request.currency,
      });
      return data;
    },
  };
}
