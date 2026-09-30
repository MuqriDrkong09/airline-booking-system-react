import {
  createMockFlightStatusApi,
  generateMockFlightStatus,
  isValidFlightNumber,
  normalizeFlightNumber,
  resolveOperationalStatus,
} from '@/features/flights';

describe('flight status data', () => {
  it('normalizes and validates flight numbers', () => {
    expect(normalizeFlightNumber(' mh 123 ')).toBe('MH123');
    expect(isValidFlightNumber('MH123')).toBe(true);
    expect(isValidFlightNumber('SQ169')).toBe(true);
    expect(isValidFlightNumber('12')).toBe(false);
    expect(isValidFlightNumber('FLIGHT')).toBe(false);
  });

  it('builds deterministic status records with required display fields', () => {
    const first = generateMockFlightStatus(
      { flightNumber: 'MH123', date: '2026-10-20' },
      { nowIsoDate: '2026-10-01' },
    );
    const second = generateMockFlightStatus(
      { flightNumber: 'mh 123', date: '2026-10-20' },
      { nowIsoDate: '2026-10-01' },
    );

    expect(first).not.toBeNull();
    expect(first).toEqual(second);
    expect(first).toMatchObject({
      flightNumber: 'MH123',
      date: '2026-10-20',
      airline: expect.objectContaining({ code: 'MH', name: 'Malaysia Airlines' }),
      terminal: expect.any(String),
      gate: expect.any(String),
      status: expect.any(String),
    });
    expect(first?.origin.code).toBeTruthy();
    expect(first?.destination.code).toBeTruthy();
    expect(first?.scheduledDeparture).toMatch(/^2026-10-20T\d{2}:\d{2}$/);
    expect(first?.estimatedDeparture).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
    expect(first?.scheduledArrival).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
    expect(first?.estimatedArrival).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
  });

  it('returns null for the ZZ000 empty fixture', () => {
    expect(
      generateMockFlightStatus({ flightNumber: 'ZZ000', date: '2026-10-20' }),
    ).toBeNull();
  });

  it('resolves past dates to arrived or cancelled', () => {
    const status = resolveOperationalStatus('2020-01-01', 3, '2026-10-01');
    expect(['ARRIVED', 'CANCELLED']).toContain(status);
  });
});

describe('flight status API', () => {
  it('looks up a flight through the mock API', async () => {
    const api = createMockFlightStatusApi({ delayMs: 0 });
    const result = await api.lookupFlightStatus({
      flightNumber: 'SQ169',
      date: '2026-11-01',
    });

    expect(result?.flightNumber).toBe('SQ169');
    expect(result?.airline.code).toBe('SQ');
  });

  it('throws for the ERR1 error fixture', async () => {
    const api = createMockFlightStatusApi({ delayMs: 0 });
    await expect(
      api.lookupFlightStatus({ flightNumber: 'ERR1', date: '2026-10-20' }),
    ).rejects.toThrow(/Unable to look up flight status/i);
  });
});
