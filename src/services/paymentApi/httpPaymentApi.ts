import type { AxiosInstance } from 'axios';
import type { PaymentApi } from '@/features/payment/api/paymentApi.types';
import type {
  ProcessPaymentRequest,
  ProcessPaymentResult,
} from '@/features/payment/types/payment';
import { API_ENDPOINTS, apiClient, toApiError } from '@/services/api';

/**
 * HTTP payment gateway client.
 * Card fields must only be posted over TLS to a PCI-compliant processor.
 */
export function createHttpPaymentApi(client: AxiosInstance = apiClient): PaymentApi {
  return {
    async processPayment(request: ProcessPaymentRequest): Promise<ProcessPaymentResult> {
      try {
        const { card: _card, ...safeBody } = request;
        void _card;
        const { data } = await client.post<ProcessPaymentResult>(API_ENDPOINTS.payments.process, {
          ...safeBody,
          hasCard: Boolean(request.card),
        });
        return data;
      } catch (error) {
        throw toApiError(error);
      }
    },
  };
}
