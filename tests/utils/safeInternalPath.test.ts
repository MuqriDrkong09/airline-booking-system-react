import { isSafeInternalPath, toSafeInternalPath } from '@/utils/safeInternalPath';

const ROOTS = ['/app', '/admin'] as const;

describe('safeInternalPath', () => {
  it('accepts exact roots and nested paths', () => {
    expect(isSafeInternalPath('/app', ROOTS)).toBe(true);
    expect(isSafeInternalPath('/app/bookings', ROOTS)).toBe(true);
    expect(isSafeInternalPath('/admin/flights', ROOTS)).toBe(true);
    expect(toSafeInternalPath('/app/flights?cabin=ECONOMY', ROOTS)).toBe(
      '/app/flights?cabin=ECONOMY',
    );
  });

  it('rejects prefix collisions and external targets', () => {
    expect(isSafeInternalPath('/apple', ROOTS)).toBe(false);
    expect(isSafeInternalPath('/administrator', ROOTS)).toBe(false);
    expect(isSafeInternalPath('//evil.example', ROOTS)).toBe(false);
    expect(isSafeInternalPath('https://evil.example/app', ROOTS)).toBe(false);
    expect(isSafeInternalPath('/\\evil.example', ROOTS)).toBe(false);
    expect(toSafeInternalPath('/apple', ROOTS)).toBeNull();
  });
});
