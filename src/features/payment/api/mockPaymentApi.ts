import { MOCK_DECLINE_CARD_NUMBER } from '../constants/paymentMethods';
import { detectCardBrand, digitsOnlyFromCard } from '../utils/paymentHelpers';
import { isCardPaymentMethod } from '../types/payment';
import type { ProcessPaymentRequest, ProcessPaymentResult } from '../types/payment';
import type { PaymentApi } from './paymentApi.types';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function createTransactionId(): string {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `TXN-${stamp}-${rand}`;
}

/**
 * In-memory mock processor. Card PAN/CVV are used only for the decision and
 * never returned or stored beyond this call stack.
 */
export function createMockPaymentApi(options?: {
  latencyMs?: number;
}): PaymentApi {
  const latencyMs = options?.latencyMs ?? 900;
  const processedKeys = new Set<string>();

  return {
    async processPayment(request: ProcessPaymentRequest): Promise<ProcessPaymentResult> {
      await delay(latencyMs);

      if (processedKeys.has(request.idempotencyKey)) {
        return {
          ok: false,
          status: 'DUPLICATE',
          method: request.method,
          message: 'This payment was already submitted. Refresh or wait for the previous result.',
        };
      }

      if (request.amount <= 0) {
        return {
          ok: false,
          status: 'FAILED',
          method: request.method,
          message: 'Payment amount must be greater than zero.',
        };
      }

      if (isCardPaymentMethod(request.method)) {
        const card = request.card;
        if (!card) {
          return {
            ok: false,
            status: 'FAILED',
            method: request.method,
            message: 'Card details are required for this payment method.',
          };
        }

        const pan = digitsOnlyFromCard(card.cardNumber);
        if (pan === digitsOnlyFromCard(MOCK_DECLINE_CARD_NUMBER) || card.cvv === '000') {
          return {
            ok: false,
            status: 'FAILED',
            method: request.method,
            message: 'Payment declined by the issuer. Check your details or try another card.',
          };
        }

        processedKeys.add(request.idempotencyKey);
        return {
          ok: true,
          status: 'SUCCESS',
          transactionId: createTransactionId(),
          method: request.method,
          message: 'Payment successful. Your booking is confirmed.',
          cardBrand: detectCardBrand(pan),
          cardLast4: pan.slice(-4),
          billingName: card.cardHolder.trim(),
        };
      }

      // FPX / e-wallet mock always succeeds after latency.
      processedKeys.add(request.idempotencyKey);
      return {
        ok: true,
        status: 'SUCCESS',
        transactionId: createTransactionId(),
        method: request.method,
        message: 'Payment successful. Your booking is confirmed.',
        cardBrand: '',
        cardLast4: '',
        billingName: '',
      };
    },
  };
}

export const mockPaymentApi = createMockPaymentApi();
