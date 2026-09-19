import {
  createMockAirportsApi,
  getAirportByCode,
  getAirports,
  MOCK_AIRPORTS,
  searchAirports,
} from '@/features/flights';

describe('airports API', () => {
  it('returns all airports including inactive by default', async () => {
    const airports = await getAirports();
    expect(airports.length).toBe(MOCK_AIRPORTS.length);
    expect(airports.some((airport) => airport.code === 'SZB' && !airport.active)).toBe(true);
  });

  it('filters to active airports when requested', async () => {
    const airports = await getAirports({ activeOnly: true });
    expect(airports.every((airport) => airport.active)).toBe(true);
    expect(airports.some((airport) => airport.code === 'SZB')).toBe(false);
  });

  it('finds an airport by code case-insensitively', async () => {
    const airport = await getAirportByCode('kul');
    expect(airport?.code).toBe('KUL');
    expect(airport?.city).toBe('Kuala Lumpur');
  });

  it('returns null for unknown airport codes', async () => {
    await expect(getAirportByCode('ZZZ')).resolves.toBeNull();
  });

  it('searches by airport code, name, city, and country', async () => {
    const byCode = await searchAirports({ query: 'SIN' });
    expect(byCode[0]?.code).toBe('SIN');

    const byName = await searchAirports({ query: 'Changi' });
    expect(byName.some((airport) => airport.code === 'SIN')).toBe(true);

    const byCity = await searchAirports({ query: 'Tokyo' });
    expect(byCity.map((airport) => airport.code).sort()).toEqual(['HND', 'NRT']);

    const byCountry = await searchAirports({ query: 'Malaysia' });
    expect(byCountry.every((airport) => airport.country === 'Malaysia')).toBe(true);
    expect(byCountry.some((airport) => airport.code === 'SZB')).toBe(false);
  });

  it('can include inactive airports in search results', async () => {
    const api = createMockAirportsApi();
    const results = await api.searchAirports({
      query: 'Subang',
      activeOnly: false,
    });

    expect(results.some((airport) => airport.code === 'SZB')).toBe(true);
  });
});
