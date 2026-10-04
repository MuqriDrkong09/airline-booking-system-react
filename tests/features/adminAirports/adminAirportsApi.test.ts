import type { AxiosInstance } from 'axios';
import {
  airportFormSchema,
  createHttpAdminAirportsApi,
  createMockAdminAirportsApi,
  createSeedAdminAirports,
  filterAdminAirports,
  mockAdminAirportsApi,
  toAdminAirportInput,
} from '@/features/adminAirports';

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
});

describe('mockAdminAirportsApi', () => {
  beforeEach(() => {
    mockAdminAirportsApi.reset();
  });

  it('lists, creates, updates, toggles active, and deletes airports', async () => {
    const api = createMockAdminAirportsApi({ delayMs: 0 });
    const listed = await api.listAirports();
    expect(listed.length).toBeGreaterThan(0);

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

  it('rejects duplicate airport codes', async () => {
    const api = createMockAdminAirportsApi({ delayMs: 0 });
    await expect(
      api.createAirport({
        code: 'KUL',
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
  });
});

describe('createHttpAdminAirportsApi', () => {
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
});
