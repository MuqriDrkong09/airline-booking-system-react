import { detectCardBrand as detectBrandFromSchema } from '../schemas/cardSchema';

export function digitsOnlyFromCard(value: string): string {
  return value.replace(/\D/g, '');
}

export function detectCardBrand(cardNumber: string): string {
  return detectBrandFromSchema(cardNumber);
}

export function createPaymentIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `pay-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createBookingReference(transactionId: string): string {
  const suffix = transactionId.replace(/[^A-Z0-9]/gi, '').slice(-8).toUpperCase();
  return `AB-${suffix || Date.now().toString(36).toUpperCase()}`;
}
