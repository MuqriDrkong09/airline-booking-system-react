import {
  formatBookingTimestamp,
  isValidBookingReference,
} from '@/features/booking/utils/bookingDetailHelpers';

describe('bookingDetailHelpers', () => {
  it('validates booking references', () => {
    expect(isValidBookingReference('AB-ABC123')).toBe(true);
    expect(isValidBookingReference('')).toBe(false);
    expect(isValidBookingReference('ab')).toBe(false);
    expect(isValidBookingReference('bad ref!')).toBe(false);
  });

  it('formats booking timestamps', () => {
    const formatted = formatBookingTimestamp('2026-09-01T10:00:00.000Z');
    expect(formatted).not.toBe('2026-09-01T10:00:00.000Z');
    expect(formatted.length).toBeGreaterThan(0);
    expect(formatBookingTimestamp('not-a-date')).toBe('not-a-date');
  });
});
