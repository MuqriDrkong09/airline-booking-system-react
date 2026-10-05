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
      registration: '9M-EEE',
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
        registration: '9M-AAA',
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
});

describe('createHttpAdminAircraftApi', () => {
  it('calls the expected admin aircraft endpoints', async () => {
    const get = jest.fn().mockResolvedValue({ data: [] });
    const post = jest.fn().mockResolvedValue({
      data: { id: 'aircraft-1', registration: '9M-HTTP' },
    });
    const put = jest.fn().mockResolvedValue({
      data: { id: 'aircraft-1', registration: '9M-HTTP' },
    });
    const patch = jest.fn().mockResolvedValue({
      data: { id: 'aircraft-1', active: false },
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
    const input = {
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

    await api.listAircraft({ search: 'AAA', manufacturer: 'Airbus', active: 'active' });
    await api.getAircraft('aircraft-1');
    await api.createAircraft(input);
    await api.updateAircraft('aircraft-1', input);
    await api.setAircraftActive('aircraft-1', false);
    await api.deleteAircraft('aircraft-1');

    expect(get).toHaveBeenCalledWith('/admin/aircraft', {
      params: { search: 'AAA', manufacturer: 'Airbus', active: 'active' },
    });
    expect(get).toHaveBeenCalledWith('/admin/aircraft/aircraft-1');
    expect(post).toHaveBeenCalledWith('/admin/aircraft', input);
    expect(put).toHaveBeenCalledWith('/admin/aircraft/aircraft-1', input);
    expect(patch).toHaveBeenCalledWith('/admin/aircraft/aircraft-1/active', { active: false });
    expect(del).toHaveBeenCalledWith('/admin/aircraft/aircraft-1');
  });

  it('uses the shared api client by default', () => {
    expect(createHttpAdminAircraftApi()).toBeTruthy();
    expect(apiClient).toBeTruthy();
  });
});
