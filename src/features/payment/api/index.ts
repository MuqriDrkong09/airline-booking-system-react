import { env } from '@/config/env';
import type { ProcessPaymentRequest, ProcessPaymentResult } from '../types/payment';
import { createHttpPaymentApi } from './httpPaymentApi';
import { mockPaymentApi } from './mockPaymentApi';
import type { PaymentApi } from './paymentApi.types';

export const paymentApi: PaymentApi = env.useMockAuth
  ? mockPaymentApi
  : createHttpPaymentApi();

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
