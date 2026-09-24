import { useMutation } from '@tanstack/react-query';
import { paymentKeys, processPaymentRequest } from '../api';
import type { ProcessPaymentRequest, ProcessPaymentResult } from '../types/payment';

export function useProcessPaymentMutation() {
  return useMutation({
    mutationKey: paymentKeys.process(),
    mutationFn: (request: ProcessPaymentRequest): Promise<ProcessPaymentResult> =>
      processPaymentRequest(request),
  });
}
