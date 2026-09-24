import type { ProcessPaymentRequest, ProcessPaymentResult } from '../types/payment';

export interface PaymentApi {
  processPayment(request: ProcessPaymentRequest): Promise<ProcessPaymentResult>;
}
