import type { AxiosInstance } from 'axios';
import {
  canModifyBooking,
  canRefundBooking,
  createHttpAdminBookingsApi,
  createMockAdminBookingsApi,
  createSeedAdminBookings,
  EMPTY_ADMIN_BOOKING_QUERY,
  filterAdminBookings,
  mockAdminBookingsApi,
  queryAdminBookings,
  sortAdminBookings,
} from '@/features/adminBookings';
import { apiClient } from '@/services/api/client';
import { addDaysIso, todayIsoDate } from '@/features/flights/utils/dates';

describe('queryAdminBookings', () => {
  const bookings = createSeedAdminBookings();

  it('filters by search, status, flight, and departure date range', () => {
    const day14 = addDaysIso(todayIsoDate(), 14);

    expect(
      filterAdminBookings(bookings, {
        search: 'aisha',
        status: '',
        dateFrom: '',
        dateTo: '',
        flight: '',
      }).map((booking) => booking.reference),
    ).toEqual(['AB-ADMIN001']);

    expect(
      filterAdminBookings(bookings, {
        search: '',
        status: 'PENDING',
        dateFrom: '',
        dateTo: '',
        flight: '',
      }).map((booking) => booking.reference),
    ).toEqual(['AB-ADMIN002']);

    expect(
      filterAdminBookings(bookings, {
        search: '',
        status: '',
        dateFrom: '',
        dateTo: '',
        flight: 'TG408',
      }).map((booking) => booking.reference),
    ).toEqual(expect.arrayContaining(['AB-ADMIN005', 'AB-ADMIN006']));

    expect(
      filterAdminBookings(bookings, {
        search: '',
        status: '',
        dateFrom: day14,
        dateTo: day14,
        flight: '',
      }).every((booking) => booking.flight.departureTime.startsWith(day14)),
    ).toBe(true);
  });

  it('sorts and paginates server-side', () => {
    const sortedAsc = sortAdminBookings(bookings, 'reference', 'asc');
    expect(sortedAsc[0]?.reference).toBe('AB-ADMIN001');
    expect(sortedAsc[sortedAsc.length - 1]?.reference).toBe('AB-ADMIN007');

    const page = queryAdminBookings(bookings, {
      ...EMPTY_ADMIN_BOOKING_QUERY,
      sortBy: 'reference',
      sortDir: 'asc',
      page: 2,
      pageSize: 3,
    });

    expect(page.total).toBe(bookings.length);
    expect(page.page).toBe(2);
    expect(page.pageCount).toBe(3);
    expect(page.items.map((booking) => booking.reference)).toEqual([
      'AB-ADMIN004',
      'AB-ADMIN005',
      'AB-ADMIN006',
    ]);
  });
});

describe('admin booking actions', () => {
  it('allows modify for active bookings and refund for cancelled zero-refund fares', () => {
    const bookings = createSeedAdminBookings();
    const confirmed = bookings.find((booking) => booking.reference === 'AB-ADMIN001')!;
    const cancelled = bookings.find((booking) => booking.reference === 'AB-ADMIN004')!;
    const completed = bookings.find((booking) => booking.reference === 'AB-ADMIN007')!;

    expect(canModifyBooking(confirmed)).toBe(true);
    expect(canModifyBooking(completed)).toBe(false);
    expect(canRefundBooking(cancelled)).toBe(true);
    expect(canRefundBooking(confirmed)).toBe(true);
  });
});

describe('mockAdminBookingsApi', () => {
  beforeEach(() => {
    mockAdminBookingsApi.reset();
  });

  it('lists with query params and supports cancel, refund, and modify', async () => {
    const api = createMockAdminBookingsApi({ delayMs: 0 });

    const listed = await api.listBookings({
      ...EMPTY_ADMIN_BOOKING_QUERY,
      search: 'AB-ADMIN001',
    });
    expect(listed.items).toHaveLength(1);
    expect(listed.items[0]?.reference).toBe('AB-ADMIN001');

    const flights = await api.listFlightOptions();
    expect(flights).toEqual(expect.arrayContaining(['MH1', 'SQ118', 'TG408']));

    const cancelled = await api.cancelBooking('AB-ADMIN001');
    expect(['CANCELLED', 'REFUNDED']).toContain(cancelled.status);

    const refunded = await api.refundBooking('AB-ADMIN004');
    expect(refunded.status).toBe('REFUNDED');
    expect(refunded.cancellation?.refundAmount).toBeGreaterThan(0);

    const modified = await api.modifyBooking('AB-ADMIN002', {
      contactEmail: 'updated@example.com',
      contactPhone: '+60110000000',
    });
    expect(modified.passengers[0]?.email).toBe('updated@example.com');
    expect(modified.passengers[0]?.phone).toBe('+60110000000');
    expect(modified.payment.billingEmail).toBe('updated@example.com');
  });

  it('rejects missing bookings and invalid modifications', async () => {
    const api = createMockAdminBookingsApi({ delayMs: 0 });

    await expect(api.getBooking('MISSING')).rejects.toThrow('Booking not found');
    await expect(api.cancelBooking('MISSING')).rejects.toThrow('Booking not found');
    await expect(
      api.modifyBooking('AB-ADMIN007', { contactEmail: 'x@example.com' }),
    ).rejects.toThrow('This booking cannot be modified.');
  });

  it('exposes reset and getState on the shared mock', async () => {
    await mockAdminBookingsApi.cancelBooking('AB-ADMIN002');
    expect(
      mockAdminBookingsApi.getState().find((booking) => booking.reference === 'AB-ADMIN002')
        ?.status,
    ).not.toBe('PENDING');

    mockAdminBookingsApi.reset();
    expect(
      mockAdminBookingsApi.getState().find((booking) => booking.reference === 'AB-ADMIN002')
        ?.status,
    ).toBe('PENDING');
  });
});

describe('createHttpAdminBookingsApi', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('sends list filters as query parameters and calls mutation endpoints', async () => {
    const seed = createSeedAdminBookings()[0]!;
    const listResult = {
      items: [seed],
      total: 1,
      page: 1,
      pageSize: 10,
      pageCount: 1,
    };
    const get = jest.fn().mockResolvedValue({ data: listResult });
    const post = jest.fn().mockResolvedValue({ data: seed });
    const patch = jest.fn().mockResolvedValue({ data: seed });
    const client = { get, post, patch } as unknown as AxiosInstance;
    const api = createHttpAdminBookingsApi(client);

    await api.listBookings({
      ...EMPTY_ADMIN_BOOKING_QUERY,
      search: 'Aisha',
      status: 'CONFIRMED',
      dateFrom: '2026-10-01',
      dateTo: '2026-10-30',
      flight: 'MH1',
      sortBy: 'departure',
      sortDir: 'asc',
      page: 2,
      pageSize: 5,
    });

    expect(get).toHaveBeenCalledWith('/admin/bookings', {
      params: {
        page: '2',
        pageSize: '5',
        sortBy: 'departure',
        sortDir: 'asc',
        search: 'Aisha',
        status: 'CONFIRMED',
        dateFrom: '2026-10-01',
        dateTo: '2026-10-30',
        flight: 'MH1',
      },
    });

    get.mockResolvedValueOnce({ data: seed });
    await api.getBooking('AB/ADMIN001');
    expect(get).toHaveBeenCalledWith('/admin/bookings/AB%2FADMIN001');

    await api.cancelBooking('AB-ADMIN001');
    expect(post).toHaveBeenCalledWith('/admin/bookings/AB-ADMIN001/cancel');

    await api.refundBooking('AB-ADMIN004');
    expect(post).toHaveBeenCalledWith('/admin/bookings/AB-ADMIN004/refund');

    await api.modifyBooking('AB-ADMIN001', { contactEmail: 'a@example.com' });
    expect(patch).toHaveBeenCalledWith('/admin/bookings/AB-ADMIN001', {
      contactEmail: 'a@example.com',
    });

    get.mockResolvedValueOnce({ data: ['MH1'] });
    await api.listFlightOptions();
    expect(get).toHaveBeenCalledWith('/admin/bookings/flight-options');
  });

  it('uses the shared apiClient when no client is injected', async () => {
    const seed = createSeedAdminBookings()[0]!;
    const get = jest.spyOn(apiClient, 'get').mockResolvedValue({
      data: {
        items: [seed],
        total: 1,
        page: 1,
        pageSize: 10,
        pageCount: 1,
      },
    });

    const api = createHttpAdminBookingsApi();
    const data = await api.listBookings({
      ...EMPTY_ADMIN_BOOKING_QUERY,
      search: 'AB-ADMIN001',
    });

    expect(get).toHaveBeenCalledWith('/admin/bookings', {
      params: {
        page: '1',
        pageSize: '10',
        sortBy: 'createdAt',
        sortDir: 'desc',
        search: 'AB-ADMIN001',
      },
    });
    expect(data.items[0]?.reference).toBe(seed.reference);
  });
});
