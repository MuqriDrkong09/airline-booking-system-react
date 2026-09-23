import { useMutation } from '@tanstack/react-query';
import { promoKeys, validatePromoCodeRequest } from '../api';
import type { PromoValidateRequest, PromoValidationResult } from '../types/promo';

export function useValidatePromoCodeMutation() {
  return useMutation({
    mutationKey: promoKeys.validations(),
    mutationFn: (request: PromoValidateRequest): Promise<PromoValidationResult> =>
      validatePromoCodeRequest(request),
  });
}
