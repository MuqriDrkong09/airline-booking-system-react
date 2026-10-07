import type { AxiosInstance } from 'axios';
import { API_ENDPOINTS, apiClient } from '@/services/api';
import type { PromoValidateRequest, PromoValidationResult } from '../types/promo';
import type { PromoApi } from './promoApi.types';

export function createHttpPromoApi(client: AxiosInstance = apiClient): PromoApi {
  return {
    async validatePromoCode(request: PromoValidateRequest): Promise<PromoValidationResult> {
      const { data } = await client.post<PromoValidationResult>(API_ENDPOINTS.promoCodes.validate, {
        code: request.code,
        subtotal: request.subtotal,
        currency: request.currency,
      });
      return data;
    },
  };
}
