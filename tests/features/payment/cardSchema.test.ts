import { cardFormSchema, formatCardNumberInput, formatExpiryInput } from '@/features/payment';

describe('cardFormSchema', () => {
  const valid = {
    cardNumber: '4111 1111 1111 1111',
    cardHolder: 'Ada Lovelace',
    expiryDate: '12/99',
    cvv: '123',
  };

  it('accepts a valid card payload', () => {
    expect(cardFormSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects an invalid card number', () => {
    const result = cardFormSchema.safeParse({
      ...valid,
      cardNumber: '1234',
    });
    expect(result.success).toBe(false);
  });

  it('rejects an expired card', () => {
    const result = cardFormSchema.safeParse({
      ...valid,
      expiryDate: '01/20',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a short CVV', () => {
    const result = cardFormSchema.safeParse({
      ...valid,
      cvv: '12',
    });
    expect(result.success).toBe(false);
  });

  it('formats card number and expiry input', () => {
    expect(formatCardNumberInput('4111111111111111')).toBe('4111 1111 1111 1111');
    expect(formatExpiryInput('1229')).toBe('12/29');
  });
});
