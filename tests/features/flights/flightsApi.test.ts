import {
  createMockFlightsApi,
  generateMockFlightOffers,
  searchFlights,
} from '@/features/flights';

describe('flights API', () => {
  it('generates deterministic offers for a known route', () => {
    const request = {
      from: 'KUL',
      to: 'NRT',
      departure: '2026-10-20',
      adults: 2,
      children: 0,
      infants: 0,
      cabinClass: 'ECONOMY' as const,
    };

    const first = generateMockFlightOffers(request);
    const second = generateMockFlightOffers(request);

    expect(first.length).toBeGreaterThan(0);
    expect(first).toEqual(second);
    expect(first[0]).toMatchObject({
      origin: { code: 'KUL' },
      destination: { code: 'NRT' },
      cabinClass: 'ECONOMY',
    });
    expect(first[0]?.airline.logoUrl).toBeTruthy();
    expect(first[0]?.flightNumber).toMatch(/^[A-Z]{2}\d+$/);
    expect(first[0]?.baggage.checkedKg).toBeGreaterThan(0);
    expect(first[0]?.availableSeats).toBeGreaterThan(0);
  });

  it('returns an empty list for the ZZZ empty fixture', () => {
    expect(
      generateMockFlightOffers({
        from: 'KUL',
        to: 'ZZZ',
        departure: '2026-10-20',
        adults: 1,
        children: 0,
        infants: 0,
        cabinClass: 'ECONOMY',
      }),
    ).toEqual([]);
  });

  it('searchFlights resolves through the mock API', async () => {
    const response = await searchFlights({
      from: 'SIN',
      to: 'KUL',
      departure: '2026-11-01',
      adults: 1,
      children: 0,
      infants: 0,
      cabinClass: 'BUSINESS',
    });

    expect(response.flights.length).toBeGreaterThan(0);
    expect(response.currency).toBe('MYR');
  });

  it('throws for the ERR error fixture', async () => {
    const api = createMockFlightsApi({ delayMs: 0 });
    await expect(
      api.searchFlights({
        from: 'ERR',
        to: 'KUL',
        departure: '2026-10-20',
        adults: 1,
        children: 0,
        infants: 0,
        cabinClass: 'ECONOMY',
      }),
    ).rejects.toThrow(/Unable to search flights/i);
  });
});
