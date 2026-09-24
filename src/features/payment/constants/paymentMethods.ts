import type { PaymentMethod } from '@/features/booking';

export interface PaymentMethodOption {
  value: PaymentMethod;
  label: string;
  description: string;
}

export const PAYMENT_METHOD_OPTIONS: readonly PaymentMethodOption[] = [
  {
    value: 'CREDIT_CARD',
    label: 'Credit Card',
    description: 'Pay with Visa, Mastercard, or Amex.',
  },
  {
    value: 'DEBIT_CARD',
    label: 'Debit Card',
    description: 'Pay directly from your bank debit card.',
  },
  {
    value: 'FPX',
    label: 'FPX',
    description: 'Online banking transfer via FPX.',
  },
  {
    value: 'E_WALLET',
    label: 'E-wallet',
    description: 'Pay with a supported e-wallet balance.',
  },
] as const;

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CREDIT_CARD: 'Credit Card',
  DEBIT_CARD: 'Debit Card',
  FPX: 'FPX',
  E_WALLET: 'E-wallet',
};

/** Demo decline card — ends with 0002. */
export const MOCK_DECLINE_CARD_NUMBER = '4000000000000002';

/** Demo success card. */
export const MOCK_SUCCESS_CARD_NUMBER = '4111111111111111';
