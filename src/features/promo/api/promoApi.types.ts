import type { PromoValidateRequest, PromoValidationResult } from '../types/promo';

export interface PromoApi {
  validatePromoCode(request: PromoValidateRequest): Promise<PromoValidationResult>;
}
