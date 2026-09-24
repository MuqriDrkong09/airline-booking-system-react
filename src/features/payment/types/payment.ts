import type { PaymentMethod } from '@/features/booking';

export const PAYMENT_UI_STATUSES = [
  'IDLE',
  'PROCESSING',
  'SUCCESS',
  'FAILED',
] as const;

export type PaymentUiStatus = (typeof PAYMENT_UI_STATUSES)[number];

export interface CardFormValues {
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  cvv: string;
}

export interface ProcessPaymentRequest {
  method: PaymentMethod;
  amount: number;
  currency: string;
  flightId: string | null;
  /** Client-generated key used to reject duplicate submits. */
  idempotencyKey: string;
  billingEmail?: string;
  /** Present only for card methods — never written to booking persistence. */
  card?: CardFormValues;
}

export type ProcessPaymentResult =
  | {
      ok: true;
      status: 'SUCCESS';
      transactionId: string;
      message: string;
      method: PaymentMethod;
      cardBrand: string;
      cardLast4: string;
      billingName: string;
    }
  | {
      ok: false;
      status: 'FAILED' | 'DUPLICATE';
      message: string;
      method: PaymentMethod;
    };

export function isCardPaymentMethod(method: PaymentMethod): boolean {
  return method === 'CREDIT_CARD' || method === 'DEBIT_CARD';
}
