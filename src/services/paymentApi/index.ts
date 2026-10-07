import { env } from '@/config/env';
import type { PaymentApi } from '@/features/payment/api/paymentApi.types';
import { mockPaymentApi } from '@/features/payment/api/mockPaymentApi';
import { createHttpPaymentApi } from './httpPaymentApi';

export const paymentApi: PaymentApi = env.useMockAuth
  ? mockPaymentApi
  : createHttpPaymentApi();

export { createHttpPaymentApi };
export type { PaymentApi };
