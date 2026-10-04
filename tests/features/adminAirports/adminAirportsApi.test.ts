import type { AxiosInstance } from 'axios';
import {
  airportFormSchema,
  createHttpAdminAirportsApi,
  createMockAdminAirportsApi,
  createSeedAdminAirports,
  EMPTY_ADMIN_AIRPORT_FILTERS,
  filterAdminAirports,
  mockAdminAirportsApi,
  sortAdminAirports,
  toAdminAirportInput,
} from '@/features/adminAirports';
import { apiClient } from '@/services/api/client';

describe('airportFormSchema', () => {
  it('accepts a valid airport payload and uppercases the code', () => {
    const parsed = airportFormSchema.parse({
      code: 'pen',
      name: 'Penang International Airport',
      city: 'George Town',
      country: 'Malaysia',
      timezone: 'Asia/Kuala_Lumpur',
      terminals: 2,
      latitude: 5.2971,
      longitude: 100.2769,
      active: true,
    });

    expect(parsed.code).toBe('PEN');
    expect(toAdminAirportInput(parsed).terminalCount).toBe(2);
  });

  it('rejects invalid IATA codes and coordinates', () => {
    const result = airportFormSchema.safeParse({
      code: 'KU',
      name: 'Test',
      city: 'Test',
      country: 'Test',
      timezone: 'Invalid',
      terminals: 0,
      latitude: 100,
      longitude: 200,
      active: true,
    });

    expect(result.success).toBe(false);
  });
});

describe('filterAdminAirports', () => {
  const airports = createSeedAdminAirports();

  it('filters by search, country, and active status', () => {
    expect(
      filterAdminAirports(airports, {
        search: 'szb',
        country: '',
        active: '',
      }).map((airport) => airport.code),
    ).toEqual(['SZB']);

    expect(
      filterAdminAirports(airports, {
        search: '',
        country: 'Malaysia',
        active: 'inactive',
      }).every((airport) => !airport.active),
    ).toBe(true);
  });

  it('returns all airports when filters are empty', () => {
    expect(filterAdminAirports(airports, EMPTY_ADMIN_AIRPORT_FILTERS)).toHaveLength(airports.length);
  });

  it('excludes airports that do not match the country filter', () => {
    expect(
      filterAdminAirports(airports, {
        search: '',
        country: 'Malaysia',
        active: '',
      }).every((airport) => airport.country === 'Malaysia'),
    ).toBe(true);
  });

  it('keeps only active airports when the active filter is set', () => {
    const filtered = filterAdminAirports(airports, {
      search: '',
      country: '',
      active: 'active',
    });

    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.every((airport) => airport.active)).toBe(true);
    expect(filtered.some((airport) => airport.code === 'SZB')).toBe(false);
  });

  it('excludes active airports when the inactive filter is set', () => {
    const filtered = filterAdminAirports(airports, {
      search: '',
      country: '',
      active: 'inactive',
    });

    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.every((airport) => !airport.active)).toBe(true);
    expect(filtered.some((airport) => airport.code === 'KUL')).toBe(false);
  });

  it('matches search across code, name, city, country, and timezone', () => {
    expect(
      filterAdminAirports(airports, {
        search: 'kuala lumpur',
        country: '',
        active: '',
      }).map((airport) => airport.code),
    ).toContain('KUL');

    expect(
      filterAdminAirports(airports, {
        search: 'asia/singapore',
        country: '',
        active: '',
      }).map((airport) => airport.code),
    ).toEqual(['SIN']);

    expect(
      filterAdminAirports(airports, {
        search: 'no-such-airport',
        country: '',
        active: '',
      }),
    ).toEqual([]);
  });

  it('applies country and search together', () => {
    expect(
      filterAdminAirports(airports, {
        search: 'kul',
        country: 'Singapore',
        active: '',
      }),
    ).toEqual([]);

    expect(
      filterAdminAirports(airports, {
        search: 'kul',
        country: 'Malaysia',
        active: 'active',
      }).map((airport) => airport.code),
    ).toEqual(['KUL']);
  });
});

describe('sortAdminAirports', () => {
  it('sorts airports by code without mutating the input', () => {
    const unordered = [
      createSeedAdminAirports().find((airport) => airport.code === 'SZB')!,
      createSeedAdminAirports().find((airport) => airport.code === 'KUL')!,
      createSeedAdminAirports().find((airport) => airport.code === 'SIN')!,
    ];
    const originalOrder = unordered.map((airport) => airport.code);

    expect(sortAdminAirports(unordered).map((airport) => airport.code)).toEqual([
      'KUL',
      'SIN',
      'SZB',
    ]);
    expect(unordered.map((airport) => airport.code)).toEqual(originalOrder);
  });
});

describe('mockAdminAirportsApi', () => {
  beforeEach(() => {
    mockAdminAirportsApi.reset();
  });

  it('lists, creates, updates, toggles active, and deletes airports', async () => {
    const api = createMockAdminAirportsApi({ delayMs: 0 });
    const listed = await api.listAirports();
    expect(listed.length).toBeGreaterThan(0);

    const filtered = await api.listAirports({
      search: 'SZB',
      country: 'Malaysia',
      active: 'inactive',
    });
    expect(filtered.map((airport) => airport.code)).toEqual(['SZB']);

    const created = await api.createAirport({
      code: 'XYZ',
      name: 'Example International Airport',
      city: 'Example City',
      country: 'Malaysia',
      timezone: 'Asia/Kuala_Lumpur',
      terminalCount: 2,
      latitude: 1.23,
      longitude: 103.45,
      active: true,
    });
    expect(created.code).toBe('XYZ');

    const fetched = await api.getAirport(created.id);
    expect(fetched).toEqual(created);

    const updated = await api.updateAirport(created.id, {
      code: created.code,
      name: created.name,
      city: 'Updated City',
      country: created.country,
      timezone: created.timezone,
      terminalCount: 3,
      latitude: created.latitude,
      longitude: created.longitude,
      active: created.active,
    });
    expect(updated.city).toBe('Updated City');
    expect(updated.terminalCount).toBe(3);

    const deactivated = await api.setAirportActive(created.id, false);
    expect(deactivated.active).toBe(false);

    await api.deleteAirport(created.id);
    await expect(api.getAirport(created.id)).rejects.toThrow(/not found/i);
  });

  it('rejects duplicate airport codes on create and update', async () => {
    const api = createMockAdminAirportsApi({ delayMs: 0 });
    const [first, second] = await api.listAirports();
    expect(first).toBeDefined();
    expect(second).toBeDefined();

    await expect(
      api.createAirport({
        code: 'kul',
        name: 'Duplicate',
        city: 'Kuala Lumpur',
        country: 'Malaysia',
        timezone: 'Asia/Kuala_Lumpur',
        terminalCount: 1,
        latitude: 1,
        longitude: 1,
        active: true,
      }),
    ).rejects.toThrow(/already exists/i);

    await expect(
      api.updateAirport(second!.id, {
        code: first!.code,
        name: second!.name,
        city: second!.city,
        country: second!.country,
        timezone: second!.timezone,
        terminalCount: second!.terminalCount,
        latitude: second!.latitude,
        longitude: second!.longitude,
        active: second!.active,
      }),
    ).rejects.toThrow(/already exists/i);
  });

  it('throws not found for missing update, active, and delete targets', async () => {
    const api = createMockAdminAirportsApi({ delayMs: 0 });

    await expect(
      api.updateAirport('missing-id', {
        code: 'ZZZ',
        name: 'Missing',
        city: 'Nowhere',
        country: 'Nowhere',
        timezone: 'Asia/Kuala_Lumpur',
        terminalCount: 1,
        latitude: 0,
        longitude: 0,
        active: true,
      }),
    ).rejects.toThrow(/not found/i);

    await expect(api.setAirportActive('missing-id', true)).rejects.toThrow(/not found/i);
    await expect(api.deleteAirport('missing-id')).rejects.toThrow(/not found/i);
  });

  it('supports custom seed data, reset, and getState', async () => {
    const seed = createSeedAdminAirports().slice(0, 1);
    const api = createMockAdminAirportsApi({
      delayMs: 0,
      initialAirports: seed,
    });

    expect(api.getState()).toHaveLength(1);
    expect((await api.listAirports())[0]?.code).toBe(seed[0]?.code);

    await api.createAirport({
      code: 'ZZZ',
      name: 'Temporary Airport',
      city: 'Temp',
      country: 'Malaysia',
      timezone: 'Asia/Kuala_Lumpur',
      terminalCount: 1,
      latitude: 1,
      longitude: 1,
      active: true,
    });
    expect(api.getState()).toHaveLength(2);

    api.reset();
    expect(api.getState()).toHaveLength(1);
    expect(api.getState()[0]?.code).toBe(seed[0]?.code);

    expect(mockAdminAirportsApi.getState().length).toBeGreaterThan(1);
  });
});

describe('createHttpAdminAirportsApi', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('calls admin airport endpoints', async () => {
    const seed = createSeedAdminAirports()[0]!;
    const get = jest.fn().mockResolvedValue({ data: [seed] });
    const post = jest.fn().mockResolvedValue({ data: seed });
    const put = jest.fn().mockResolvedValue({ data: seed });
    const patch = jest.fn().mockResolvedValue({ data: { ...seed, active: false } });
    const del = jest.fn().mockResolvedValue({ data: undefined });
    const client = { get, post, put, patch, delete: del } as unknown as AxiosInstance;
    const api = createHttpAdminAirportsApi(client);

    await api.listAirports({
      search: 'KUL',
      country: 'Malaysia',
      active: 'active',
    });
    expect(get).toHaveBeenCalledWith('/admin/airports', {
      params: {
        search: 'KUL',
        country: 'Malaysia',
        active: 'active',
      },
    });

    await api.getAirport('airport-kul');
    expect(get).toHaveBeenCalledWith('/admin/airports/airport-kul');

    await api.createAirport(seed);
    expect(post).toHaveBeenCalledWith('/admin/airports', seed);

    await api.updateAirport('airport-kul', seed);
    expect(put).toHaveBeenCalledWith('/admin/airports/airport-kul', seed);

    await api.setAirportActive('airport-kul', false);
    expect(patch).toHaveBeenCalledWith('/admin/airports/airport-kul/active', {
      active: false,
    });

    await api.deleteAirport('airport-kul');
    expect(del).toHaveBeenCalledWith('/admin/airports/airport-kul');
  });

  it('omits empty list query params and encodes airport ids', async () => {
    const seed = createSeedAdminAirports()[0]!;
    const get = jest.fn().mockResolvedValue({ data: [seed] });
    const client = { get } as unknown as AxiosInstance;
    const api = createHttpAdminAirportsApi(client);

    await api.listAirports();
    expect(get).toHaveBeenCalledWith('/admin/airports', { params: undefined });

    await api.listAirports({
      search: '   ',
      country: '',
      active: '',
    });
    expect(get).toHaveBeenLastCalledWith('/admin/airports', { params: undefined });

    await api.listAirports({
      search: '',
      country: 'Japan',
      active: 'inactive',
    });
    expect(get).toHaveBeenLastCalledWith('/admin/airports', {
      params: {
        country: 'Japan',
        active: 'inactive',
      },
    });

    await api.getAirport('airport/kul');
    expect(get).toHaveBeenLastCalledWith('/admin/airports/airport%2Fkul');
  });

  it('uses the shared apiClient when no client is injected', async () => {
    const seed = createSeedAdminAirports()[0]!;
    const get = jest.spyOn(apiClient, 'get').mockResolvedValue({
      data: [seed],
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as never,
    });

    const api = createHttpAdminAirportsApi();
    const data = await api.listAirports({
      search: 'KUL',
      country: '',
      active: '',
    });

    expect(get).toHaveBeenCalledWith('/admin/airports', {
      params: { search: 'KUL' },
    });
    expect(data).toEqual([seed]);
  });

  it('propagates HTTP client errors', async () => {
    const get = jest.fn().mockRejectedValue(new Error('Network error'));
    const client = { get } as unknown as AxiosInstance;
    const api = createHttpAdminAirportsApi(client);

    await expect(api.listAirports()).rejects.toThrow('Network error');
  });
});
