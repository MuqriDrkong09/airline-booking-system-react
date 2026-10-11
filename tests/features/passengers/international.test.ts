import { isInternationalFlight } from '@/features/passengers/utils/international';

describe('isInternationalFlight', () => {
  it('returns false for same airport or empty codes', () => {
    expect(isInternationalFlight('KUL', 'KUL')).toBe(false);
    expect(isInternationalFlight('', 'NRT')).toBe(false);
    expect(isInternationalFlight('KUL', '')).toBe(false);
  });

  it('returns false for domestic Malaysian routes', () => {
    expect(isInternationalFlight('KUL', 'PEN')).toBe(false);
  });

  it('returns true for cross-border routes', () => {
    expect(isInternationalFlight('KUL', 'NRT')).toBe(true);
  });

  it('treats unknown airport codes as international', () => {
    expect(isInternationalFlight('KUL', 'XXX')).toBe(true);
    expect(isInternationalFlight('ZZZ', 'NRT')).toBe(true);
  });
});
