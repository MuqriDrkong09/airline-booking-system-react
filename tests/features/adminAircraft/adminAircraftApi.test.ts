import type { AxiosInstance } from 'axios';
import {
  aircraftFormSchema,
  buildDefaultSeatMapConfig,
  createHttpAdminAircraftApi,
  createMockAdminAircraftApi,
  createSeedAdminAircraft,
  filterAdminAircraft,
  mockAdminAircraftApi,
  sortAdminAircraft,
  toAdminAircraftInput,
  EMPTY_ADMIN_AIRCRAFT_FILTERS,
} from '@/features/adminAircraft';
import { apiClient } from '@/services/api/client';

describe('aircraftFormSchema', () => {
  it('accepts a valid aircraft payload and uppercases registration', () => {
    const parsed = aircraftFormSchema.parse({
      manufacturer: 'Airbus',
      model: 'A320',
      registration: '9m-zzz',
      totalSeats: 162,
      economySeats: 150,
      premiumEconomySeats: 0,
      businessSeats: 12,
      firstClassSeats: 0,
      active: true,
    });

    expect(parsed.registration).toBe('9M-ZZZ');
    expect(toAdminAircraftInput(parsed).seatMapConfig?.layoutKey).toBe('Airbus A320');
  });

  it('rejects mismatched cabin totals', () => {
    const result = aircraftFormSchema.safeParse({
      manufacturer: 'Airbus',
      model: 'A320',
      registration: '9M-ZZZ',
      totalSeats: 100,
      economySeats: 150,
      premiumEconomySeats: 0,
      businessSeats: 12,
      firstClassSeats: 0,
      active: true,
    });

    expect(result.success).toBe(false);
  });
});

describe('filterAdminAircraft', () => {
  const aircraftList = createSeedAdminAircraft();

  it('filters by search, manufacturer, and active status', () => {
    expect(
      filterAdminAircraft(aircraftList, {
        search: '9m-aaz',
        manufacturer: '',
        active: '',
      }).map((aircraft) => aircraft.registration),
    ).toEqual(['9M-AAZ']);

    expect(
      filterAdminAircraft(aircraftList, {
        search: '',
        manufacturer: 'Boeing',
        active: 'active',
      }).every((aircraft) => aircraft.manufacturer === 'Boeing' && aircraft.active),
    ).toBe(true);
  });

  it('returns all aircraft when filters are empty', () => {
    expect(filterAdminAircraft(aircraftList, EMPTY_ADMIN_AIRCRAFT_FILTERS)).toHaveLength(
      aircraftList.length,
    );
  });
});

describe('sortAdminAircraft', () => {
  it('sorts by registration without mutating the input', () => {
    const unordered = [
      createSeedAdminAircraft().find((aircraft) => aircraft.registration === '9M-BAC')!,
      createSeedAdminAircraft().find((aircraft) => aircraft.registration === '9M-AAA')!,
    ];
    const originalOrder = unordered.map((aircraft) => aircraft.registration);

    expect(sortAdminAircraft(unordered).map((aircraft) => aircraft.registration)).toEqual([
      '9M-AAA',
      '9M-BAC',
    ]);
    expect(unordered.map((aircraft) => aircraft.registration)).toEqual(originalOrder);
  });
});

describe('buildDefaultSeatMapConfig', () => {
  it('prepares cabin sections from seat counts', () => {
    const config = buildDefaultSeatMapConfig({
      manufacturer: 'Airbus',
      model: 'A350',
      economySeats: 200,
      premiumEconomySeats: 36,
      businessSeats: 42,
      firstClassSeats: 8,
    });

    expect(config.layoutKey).toBe('Airbus A350');
    expect(config.version).toBe(1);
    expect(config.cabins.map((cabin) => cabin.cabinClass)).toEqual([
      'FIRST',
      'BUSINESS',
      'PREMIUM_ECONOMY',
      'ECONOMY',
    ]);
    expect(config.cabins[0]?.seatCount).toBe(8);
    expect(config.cabins[0]?.columns).toContain('|');
  });
});

describe('mockAdminAircraftApi', () => {
  beforeEach(() => {
    mockAdminAircraftApi.reset();
  });

  it('lists, creates, updates, toggles active, and deletes aircraft', async () => {
    const api = createMockAdminAircraftApi({ delayMs: 0 });
    const listed = await api.listAircraft();
    expect(listed.length).toBeGreaterThan(0);
    expect(listed[0]?.seatMapConfig).not.toBeNull();

    const filtered = await api.listAircraft({
      search: 'AAZ',
      manufacturer: 'Airbus',
      active: 'inactive',
    });
    expect(filtered.map((aircraft) => aircraft.registration)).toEqual(['9M-AAZ']);

    const created = await api.createAircraft({
      manufacturer: 'Embraer',
      model: 'E190',
      registration: '9m-eee',
      totalSeats: 100,
      economySeats: 96,
      premiumEconomySeats: 0,
      businessSeats: 4,
      firstClassSeats: 0,
      active: true,
      seatMapConfig: null,
    });
    expect(created.registration).toBe('9M-EEE');
    expect(created.seatMapConfig?.layoutKey).toBe('Embraer E190');
    expect(created.id).toMatch(/^aircraft-admin-\d+$/);

    const fetched = await api.getAircraft(created.id);
    expect(fetched).toEqual(created);

    const updated = await api.updateAircraft(created.id, {
      ...created,
      economySeats: 92,
      businessSeats: 8,
      totalSeats: 100,
      seatMapConfig: null,
    });
    expect(updated.businessSeats).toBe(8);
    expect(updated.seatMapConfig?.cabins.some((cabin) => cabin.cabinClass === 'BUSINESS')).toBe(
      true,
    );

    const deactivated = await api.setAircraftActive(created.id, false);
    expect(deactivated.active).toBe(false);

    await api.deleteAircraft(created.id);
    await expect(api.getAircraft(created.id)).rejects.toThrow('Aircraft not found');
  });

  it('rejects duplicate registrations and invalid seat totals', async () => {
    const api = createMockAdminAircraftApi({ delayMs: 0 });

    await expect(
      api.createAircraft({
        manufacturer: 'Airbus',
        model: 'A320',
        registration: '9m-aaa',
        totalSeats: 162,
        economySeats: 150,
        premiumEconomySeats: 0,
        businessSeats: 12,
        firstClassSeats: 0,
        active: true,
        seatMapConfig: null,
      }),
    ).rejects.toThrow('registration already exists');

    await expect(
      api.createAircraft({
        manufacturer: 'Airbus',
        model: 'A320',
        registration: '9M-NEW',
        totalSeats: 100,
        economySeats: 150,
        premiumEconomySeats: 0,
        businessSeats: 12,
        firstClassSeats: 0,
        active: true,
        seatMapConfig: null,
      }),
    ).rejects.toThrow('Total seats must equal cabin seats');
  });

  it('rejects duplicate registrations on update while allowing an aircraft to keep its own', async () => {
    const api = createMockAdminAircraftApi({ delayMs: 0 });
    const [first, second] = await api.listAircraft();
    expect(first).toBeDefined();
    expect(second).toBeDefined();

    await expect(
      api.updateAircraft(second!.id, {
        manufacturer: second!.manufacturer,
        model: second!.model,
        registration: first!.registration,
        totalSeats: second!.totalSeats,
        economySeats: second!.economySeats,
        premiumEconomySeats: second!.premiumEconomySeats,
        businessSeats: second!.businessSeats,
        firstClassSeats: second!.firstClassSeats,
        active: second!.active,
        seatMapConfig: second!.seatMapConfig,
      }),
    ).rejects.toThrow('registration already exists');

    const kept = await api.updateAircraft(first!.id, {
      manufacturer: first!.manufacturer,
      model: first!.model,
      registration: first!.registration.toLowerCase(),
      totalSeats: first!.totalSeats,
      economySeats: first!.economySeats,
      premiumEconomySeats: first!.premiumEconomySeats,
      businessSeats: first!.businessSeats,
      firstClassSeats: first!.firstClassSeats,
      active: first!.active,
      seatMapConfig: first!.seatMapConfig,
    });
    expect(kept.registration).toBe(first!.registration.toUpperCase());
  });

  it('throws not found for missing get, update, activate, and delete targets', async () => {
    const api = createMockAdminAircraftApi({ delayMs: 0 });

    await expect(api.getAircraft('missing-id')).rejects.toThrow('Aircraft not found');
    await expect(
      api.updateAircraft('missing-id', {
        manufacturer: 'Airbus',
        model: 'A320',
        registration: '9M-MISS',
        totalSeats: 100,
        economySeats: 100,
        premiumEconomySeats: 0,
        businessSeats: 0,
        firstClassSeats: 0,
        active: true,
        seatMapConfig: null,
      }),
    ).rejects.toThrow('Aircraft not found');
    await expect(api.setAircraftActive('missing-id', true)).rejects.toThrow('Aircraft not found');
    await expect(api.deleteAircraft('missing-id')).rejects.toThrow('Aircraft not found');
  });

  it('supports custom seed data, getState snapshots, and reset', async () => {
    const seed = [
      {
        id: 'custom-1',
        manufacturer: 'Bombardier',
        model: 'CRJ900',
        registration: '9M-CRJ',
        totalSeats: 76,
        economySeats: 76,
        premiumEconomySeats: 0,
        businessSeats: 0,
        firstClassSeats: 0,
        active: true,
        seatMapConfig: null,
      },
    ];
    const api = createMockAdminAircraftApi({ delayMs: 0, initialAircraft: seed });

    expect(api.getState()).toHaveLength(1);
    expect(api.getState()[0]?.registration).toBe('9M-CRJ');

    await api.createAircraft({
      manufacturer: 'ATR',
      model: '72',
      registration: '9M-ATR',
      totalSeats: 70,
      economySeats: 70,
      premiumEconomySeats: 0,
      businessSeats: 0,
      firstClassSeats: 0,
      active: true,
      seatMapConfig: null,
    });
    expect(api.getState()).toHaveLength(2);

    const snapshot = await api.listAircraft();
    snapshot[0]!.registration = 'MUTATED';
    expect(api.getState()[0]?.registration).not.toBe('MUTATED');

    api.reset();
    expect(api.getState()).toHaveLength(1);
    expect(api.getState()[0]?.registration).toBe('9M-CRJ');
  });

  it('returns sorted clones from listAircraft and exposes the shared singleton reset', async () => {
    const listed = await mockAdminAircraftApi.listAircraft();
    const registrations = listed.map((aircraft) => aircraft.registration);
    expect(registrations).toEqual([...registrations].sort((a, b) => a.localeCompare(b)));

    listed[0]!.active = !listed[0]!.active;
    const again = await mockAdminAircraftApi.listAircraft();
    expect(again[0]?.active).not.toBe(listed[0]?.active);

    mockAdminAircraftApi.reset();
    expect((await mockAdminAircraftApi.listAircraft()).length).toBeGreaterThan(0);
  });
});

describe('createHttpAdminAircraftApi', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  const sampleInput = {
    manufacturer: 'Airbus',
    model: 'A320',
    registration: '9M-HTTP',
    totalSeats: 162,
    economySeats: 150,
    premiumEconomySeats: 0,
    businessSeats: 12,
    firstClassSeats: 0,
    active: true,
    seatMapConfig: null,
  };

  const sampleAircraft = {
    id: 'aircraft-1',
    ...sampleInput,
  };

  it('calls the expected admin aircraft endpoints and returns response data', async () => {
    const get = jest
      .fn()
      .mockResolvedValueOnce({ data: [sampleAircraft] })
      .mockResolvedValueOnce({ data: sampleAircraft });
    const post = jest.fn().mockResolvedValue({ data: sampleAircraft });
    const put = jest.fn().mockResolvedValue({
      data: { ...sampleAircraft, businessSeats: 16 },
    });
    const patch = jest.fn().mockResolvedValue({
      data: { ...sampleAircraft, active: false },
    });
    const del = jest.fn().mockResolvedValue({});

    const client = {
      get,
      post,
      put,
      patch,
      delete: del,
    } as unknown as AxiosInstance;

    const api = createHttpAdminAircraftApi(client);

    await expect(
      api.listAircraft({ search: 'AAA', manufacturer: 'Airbus', active: 'active' }),
    ).resolves.toEqual([sampleAircraft]);
    expect(get).toHaveBeenCalledWith('/admin/aircraft', {
      params: { search: 'AAA', manufacturer: 'Airbus', active: 'active' },
    });

    await expect(api.getAircraft('aircraft-1')).resolves.toEqual(sampleAircraft);
    expect(get).toHaveBeenCalledWith('/admin/aircraft/aircraft-1');

    await expect(api.createAircraft(sampleInput)).resolves.toEqual(sampleAircraft);
    expect(post).toHaveBeenCalledWith('/admin/aircraft', sampleInput);

    await expect(api.updateAircraft('aircraft-1', sampleInput)).resolves.toEqual({
      ...sampleAircraft,
      businessSeats: 16,
    });
    expect(put).toHaveBeenCalledWith('/admin/aircraft/aircraft-1', sampleInput);

    await expect(api.setAircraftActive('aircraft-1', false)).resolves.toEqual({
      ...sampleAircraft,
      active: false,
    });
    expect(patch).toHaveBeenCalledWith('/admin/aircraft/aircraft-1/active', { active: false });

    await expect(api.deleteAircraft('aircraft-1')).resolves.toBeUndefined();
    expect(del).toHaveBeenCalledWith('/admin/aircraft/aircraft-1');
  });

  it('omits empty list query params, trims search, and encodes aircraft ids', async () => {
    const get = jest.fn().mockResolvedValue({ data: [sampleAircraft] });
    const put = jest.fn().mockResolvedValue({ data: sampleAircraft });
    const patch = jest.fn().mockResolvedValue({ data: sampleAircraft });
    const del = jest.fn().mockResolvedValue({});
    const client = { get, put, patch, delete: del } as unknown as AxiosInstance;
    const api = createHttpAdminAircraftApi(client);

    await api.listAircraft();
    expect(get).toHaveBeenCalledWith('/admin/aircraft', { params: undefined });

    await api.listAircraft({
      search: '   ',
      manufacturer: '',
      active: '',
    });
    expect(get).toHaveBeenLastCalledWith('/admin/aircraft', { params: undefined });

    await api.listAircraft({
      search: '  AAZ  ',
      manufacturer: '',
      active: 'inactive',
    });
    expect(get).toHaveBeenLastCalledWith('/admin/aircraft', {
      params: { search: 'AAZ', active: 'inactive' },
    });

    await api.getAircraft('aircraft/1');
    expect(get).toHaveBeenLastCalledWith('/admin/aircraft/aircraft%2F1');

    await api.updateAircraft('aircraft/1', sampleInput);
    expect(put).toHaveBeenCalledWith('/admin/aircraft/aircraft%2F1', sampleInput);

    await api.setAircraftActive('aircraft/1', true);
    expect(patch).toHaveBeenCalledWith('/admin/aircraft/aircraft%2F1/active', { active: true });

    await api.deleteAircraft('aircraft/1');
    expect(del).toHaveBeenCalledWith('/admin/aircraft/aircraft%2F1');
  });

  it('uses the shared apiClient when no client is injected', async () => {
    const get = jest.spyOn(apiClient, 'get').mockResolvedValue({
      data: [sampleAircraft],
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {} as never,
    });

    const api = createHttpAdminAircraftApi();
    const data = await api.listAircraft({
      search: 'AAA',
      manufacturer: '',
      active: '',
    });

    expect(get).toHaveBeenCalledWith('/admin/aircraft', {
      params: { search: 'AAA' },
    });
    expect(data).toEqual([sampleAircraft]);
  });

  it('propagates HTTP client errors', async () => {
    const get = jest.fn().mockRejectedValue(new Error('Network error'));
    const client = { get } as unknown as AxiosInstance;
    const api = createHttpAdminAircraftApi(client);

    await expect(api.listAircraft()).rejects.toThrow('Network error');
  });
});
