import {
  createMockPaymentApi,
  MOCK_DECLINE_CARD_NUMBER,
  MOCK_SUCCESS_CARD_NUMBER,
} from '@/features/payment';

describe('mockPaymentApi', () => {
  it('succeeds for a valid credit card and never echoes the full PAN', async () => {
    const api = createMockPaymentApi({ latencyMs: 0 });
    const result = await api.processPayment({
      method: 'CREDIT_CARD',
      amount: 250,
      currency: 'USD',
      flightId: 'FL-100',
      idempotencyKey: 'key-success-1',
      card: {
        cardNumber: MOCK_SUCCESS_CARD_NUMBER,
        cardHolder: 'Ada Lovelace',
        expiryDate: '12/99',
        cvv: '123',
      },
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.cardLast4).toBe('1111');
    expect(result.cardBrand).toBe('visa');
    expect(JSON.stringify(result)).not.toContain(MOCK_SUCCESS_CARD_NUMBER);
    expect(JSON.stringify(result)).not.toContain('123');
  });

  it('fails for the known decline card', async () => {
    const api = createMockPaymentApi({ latencyMs: 0 });
    const result = await api.processPayment({
      method: 'CREDIT_CARD',
      amount: 250,
      currency: 'USD',
      flightId: 'FL-100',
      idempotencyKey: 'key-decline-1',
      card: {
        cardNumber: MOCK_DECLINE_CARD_NUMBER,
        cardHolder: 'Ada Lovelace',
        expiryDate: '12/99',
        cvv: '123',
      },
    });

    expect(result).toMatchObject({
      ok: false,
      status: 'FAILED',
    });
  });

  it('rejects duplicate idempotency keys', async () => {
    const api = createMockPaymentApi({ latencyMs: 0 });
    const payload = {
      method: 'FPX' as const,
      amount: 100,
      currency: 'USD',
      flightId: 'FL-100',
      idempotencyKey: 'key-dup-1',
    };

    const first = await api.processPayment(payload);
    const second = await api.processPayment(payload);

    expect(first.ok).toBe(true);
    expect(second).toMatchObject({
      ok: false,
      status: 'DUPLICATE',
    });
  });

  it('succeeds for e-wallet without card details', async () => {
    const api = createMockPaymentApi({ latencyMs: 0 });
    const result = await api.processPayment({
      method: 'E_WALLET',
      amount: 80,
      currency: 'USD',
      flightId: 'FL-100',
      idempotencyKey: 'key-wallet-1',
    });

    expect(result.ok).toBe(true);
  });
});
