import { apiClient } from '@/services/api';
import type { ProcessPaymentRequest, ProcessPaymentResult } from '../types/payment';
import type { PaymentApi } from './paymentApi.types';

/**
 * HTTP stub for a future real payment gateway.
 * Card fields must only be posted over TLS to a PCI-compliant processor.
 */
export function createHttpPaymentApi(): PaymentApi {
  return {
    async processPayment(request: ProcessPaymentRequest): Promise<ProcessPaymentResult> {
      // Never log or persist full card payloads on the client.
      const { card: _card, ...safeBody } = request;
      void _card;
      const { data } = await apiClient.post<ProcessPaymentResult>('/payments/process', {
        ...safeBody,
        // Real integration would tokenize card data via a PSP SDK instead.
        hasCard: Boolean(request.card),
      });
      return data;
    },
  };
}
