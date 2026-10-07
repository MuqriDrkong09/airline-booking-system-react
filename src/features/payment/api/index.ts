import type { ProcessPaymentRequest, ProcessPaymentResult } from '../types/payment';
import { paymentApi } from '@/services/paymentApi';

export { paymentApi };

export const paymentKeys = {
  all: ['payment'] as const,
  process: () => [...paymentKeys.all, 'process'] as const,
};

export function processPaymentRequest(
  request: ProcessPaymentRequest,
): Promise<ProcessPaymentResult> {
  return paymentApi.processPayment(request);
}

export type { PaymentApi } from './paymentApi.types';
export { createHttpPaymentApi } from './httpPaymentApi';
export { createMockPaymentApi, mockPaymentApi } from './mockPaymentApi';
