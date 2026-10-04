import {
  createHttpAdminFlightsApi,
  createMockAdminFlightsApi,
  createSeedAdminFlights,
  filterAdminFlights,
  flightFormSchema,
  mockAdminFlightsApi,
} from '@/features/adminFlights';
import type { AxiosInstance } from 'axios';

describe('flightFormSchema', () => {
  it('accepts a valid flight payload', () => {
    const parsed = flightFormSchema.parse({
      airline: 'MH',
      flightNumber: 'mh12',
      origin: 'KUL',
      destination: 'SIN',
      aircraft: 'A320',
      departure: '2026-10-20T09:00',
      arrival: '2026-10-20T10:05',
      terminal: 'T1',
      gate: 'A1',
      status: 'SCHEDULED',
      availableSeats: 100,
      fareClasses: ['ECONOMY', 'BUSINESS'],
    });

    expect(parsed.flightNumber).toBe('MH12');
  });

  it('rejects same origin and destination and inverted schedule', () => {
    const result = flightFormSchema.safeParse({
      airline: 'MH',
      flightNumber: 'MH1',
      origin: 'KUL',
      destination: 'KUL',
      aircraft: 'A320',
      departure: '2026-10-20T12:00',
      arrival: '2026-10-20T11:00',
      terminal: 'T1',
      gate: 'A1',
      status: 'SCHEDULED',
      availableSeats: 10,
      fareClasses: ['ECONOMY'],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const paths = result.error.issues.map((issue) => issue.path.join('.'));
      expect(paths).toEqual(expect.arrayContaining(['destination', 'arrival']));
    }
  });
});

describe('filterAdminFlights', () => {
  const flights = createSeedAdminFlights();

  it('filters by search, airline, route, and status', () => {
    expect(
      filterAdminFlights(flights, {
        search: 'mh1',
        airline: '',
        origin: '',
        destination: '',
        status: '',
      }).map((flight) => flight.flightNumber),
    ).toContain('MH1');

    expect(
      filterAdminFlights(flights, {
        search: '',
        airline: 'SQ',
        origin: 'SIN',
        destination: 'KUL',
        status: 'BOARDING',
      }),
    ).toHaveLength(1);
  });
});

describe('mockAdminFlightsApi', () => {
  beforeEach(() => {
    mockAdminFlightsApi.reset();
  });

  it('lists, creates, updates, changes status, and deletes flights', async () => {
    const api = createMockAdminFlightsApi({ delayMs: 0 });
    const listed = await api.listFlights();
    expect(listed.length).toBeGreaterThan(0);

    const created = await api.createFlight({
      airline: 'AK',
      flightNumber: 'AK999',
      origin: 'KUL',
      destination: 'BKK',
      aircraft: 'A320',
      departure: '2026-11-01T08:00',
      arrival: '2026-11-01T09:10',
      terminal: 'T2',
      gate: 'B2',
      status: 'SCHEDULED',
      availableSeats: 80,
      fareClasses: ['ECONOMY'],
    });
    expect(created.flightNumber).toBe('AK999');

    const updated = await api.updateFlight(created.id, {
      ...created,
      gate: 'B9',
      availableSeats: 70,
    });
    expect(updated.gate).toBe('B9');
    expect(updated.availableSeats).toBe(70);

    const statusUpdated = await api.updateFlightStatus(created.id, 'DELAYED');
    expect(statusUpdated.status).toBe('DELAYED');

    await api.deleteFlight(created.id);
    await expect(api.getFlight(created.id)).rejects.toThrow(/not found/i);
  });

  it('filters list results in the mock API', async () => {
    const api = createMockAdminFlightsApi({ delayMs: 0 });
    const results = await api.listFlights({
      search: 'SQ',
      airline: 'SQ',
      origin: '',
      destination: '',
      status: '',
    });

    expect(results.every((flight) => flight.airline === 'SQ')).toBe(true);
  });
});

describe('createHttpAdminFlightsApi', () => {
  it('calls admin flight endpoints', async () => {
    const seed = createSeedAdminFlights()[0]!;
    const get = jest.fn().mockResolvedValue({ data: [seed] });
    const post = jest.fn().mockResolvedValue({ data: seed });
    const put = jest.fn().mockResolvedValue({ data: seed });
    const patch = jest.fn().mockResolvedValue({ data: { ...seed, status: 'DELAYED' } });
    const del = jest.fn().mockResolvedValue({ data: undefined });
    const client = { get, post, put, patch, delete: del } as unknown as AxiosInstance;
    const api = createHttpAdminFlightsApi(client);

    await api.listFlights({
      search: 'MH',
      airline: 'MH',
      origin: 'KUL',
      destination: 'NRT',
      status: 'SCHEDULED',
    });
    expect(get).toHaveBeenCalledWith('/admin/flights', {
      params: {
        search: 'MH',
        airline: 'MH',
        origin: 'KUL',
        destination: 'NRT',
        status: 'SCHEDULED',
      },
    });

    await api.getFlight('adm-flight-1');
    expect(get).toHaveBeenCalledWith('/admin/flights/adm-flight-1');

    await api.createFlight(seed);
    expect(post).toHaveBeenCalledWith('/admin/flights', seed);

    await api.updateFlight('adm-flight-1', seed);
    expect(put).toHaveBeenCalledWith('/admin/flights/adm-flight-1', seed);

    await api.updateFlightStatus('adm-flight-1', 'DELAYED');
    expect(patch).toHaveBeenCalledWith('/admin/flights/adm-flight-1/status', {
      status: 'DELAYED',
    });

    await api.deleteFlight('adm-flight-1');
    expect(del).toHaveBeenCalledWith('/admin/flights/adm-flight-1');
  });
});
