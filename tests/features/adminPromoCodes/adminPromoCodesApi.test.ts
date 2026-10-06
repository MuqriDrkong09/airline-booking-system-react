import type { AxiosInstance } from 'axios';
import {
  createHttpAdminPromoCodesApi,
  createMockAdminPromoCodesApi,
  createSeedAdminPromoCodes,
  EMPTY_ADMIN_PROMO_CODE_FILTERS,
  filterAdminPromoCodes,
  mockAdminPromoCodesApi,
  promoCodeFormSchema,
  toAdminPromoCodeInput,
} from '@/features/adminPromoCodes';
import { apiClient } from '@/services/api/client';

describe('promoCodeFormSchema', () => {
  it('accepts a valid percentage promo and uppercases the code', () => {
    const parsed = promoCodeFormSchema.parse({
      code: 'save15',
      description: '15% off',
      discountType: 'PERCENT',
      discountValue: 15,
      minimumBookingAmount: 100,
      maximumDiscount: 80,
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      usageLimit: 100,
      active: true,
    });

    expect(parsed.code).toBe('SAVE15');
    expect(toAdminPromoCodeInput(parsed).maximumDiscount).toBe(80);
  });

  it('rejects invalid date ranges and percentage values', () => {
    const dateResult = promoCodeFormSchema.safeParse({
      code: 'BAD',
      description: 'Bad range',
      discountType: 'FIXED',
      discountValue: 20,
      minimumBookingAmount: 0,
      maximumDiscount: '',
      startDate: '2026-12-31',
      endDate: '2026-01-01',
      usageLimit: '',
      active: true,
    });
    expect(dateResult.success).toBe(false);

    const percentResult = promoCodeFormSchema.safeParse({
      code: 'OVER',
      description: 'Over 100',
      discountType: 'PERCENT',
      discountValue: 120,
      minimumBookingAmount: 0,
      maximumDiscount: '',
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      usageLimit: '',
      active: true,
    });
    expect(percentResult.success).toBe(false);
  });

  it('treats blank maximum discount and usage limit as null', () => {
    const parsed = promoCodeFormSchema.parse({
      code: 'OPEN',
      description: 'Open ended',
      discountType: 'FIXED',
      discountValue: 25,
      minimumBookingAmount: 50,
      maximumDiscount: '',
      startDate: '2026-01-01',
      endDate: '2026-06-30',
      usageLimit: '',
      active: true,
    });

    expect(parsed.maximumDiscount).toBeNull();
    expect(parsed.usageLimit).toBeNull();
  });
});

describe('filterAdminPromoCodes', () => {
  const promos = createSeedAdminPromoCodes();

  it('filters by search, discount type, and active status', () => {
    expect(
      filterAdminPromoCodes(promos, {
        search: 'save15',
        discountType: '',
        active: '',
      }).map((promo) => promo.code),
    ).toEqual(['SAVE15']);

    expect(
      filterAdminPromoCodes(promos, {
        search: '',
        discountType: 'PERCENT',
        active: 'active',
      }).every((promo) => promo.discountType === 'PERCENT' && promo.active),
    ).toBe(true);

    expect(
      filterAdminPromoCodes(promos, {
        search: '',
        discountType: '',
        active: 'inactive',
      }).every((promo) => !promo.active),
    ).toBe(true);
  });

  it('returns all promos when filters are empty', () => {
    expect(filterAdminPromoCodes(promos, EMPTY_ADMIN_PROMO_CODE_FILTERS)).toHaveLength(
      promos.length,
    );
  });
});

describe('mockAdminPromoCodesApi', () => {
  beforeEach(() => {
    mockAdminPromoCodesApi.reset();
  });

  it('lists, creates, updates, toggles active, and deletes promo codes', async () => {
    const api = createMockAdminPromoCodesApi({ delayMs: 0 });
    const listed = await api.listPromoCodes({ search: 'FLIGHT', discountType: '', active: '' });
    expect(listed.map((promo) => promo.code)).toEqual(['FLIGHT100']);

    const created = await api.createPromoCode({
      code: 'spring25',
      description: 'Spring special',
      discountType: 'PERCENT',
      discountValue: 25,
      minimumBookingAmount: 120,
      maximumDiscount: 50,
      startDate: '2026-03-01',
      endDate: '2026-05-31',
      usageLimit: 75,
      active: true,
    });
    expect(created.code).toBe('SPRING25');
    expect(created.usedCount).toBe(0);

    const updated = await api.updatePromoCode(created.id, {
      ...created,
      description: 'Updated spring special',
      discountValue: 30,
    });
    expect(updated.description).toBe('Updated spring special');
    expect(updated.discountValue).toBe(30);

    const deactivated = await api.setPromoCodeActive(created.id, false);
    expect(deactivated.active).toBe(false);

    await api.deletePromoCode(created.id);
    await expect(api.getPromoCode(created.id)).rejects.toThrow('Promo code not found');
  });

  it('rejects duplicate codes', async () => {
    const api = createMockAdminPromoCodesApi({ delayMs: 0 });
    await expect(
      api.createPromoCode({
        code: 'SAVE15',
        description: 'Duplicate',
        discountType: 'PERCENT',
        discountValue: 10,
        minimumBookingAmount: 0,
        maximumDiscount: null,
        startDate: '2026-01-01',
        endDate: '2026-12-31',
        usageLimit: null,
        active: true,
      }),
    ).rejects.toThrow('A promo code with this code already exists');
  });
});

describe('createHttpAdminPromoCodesApi', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('calls admin promo code endpoints with query params', async () => {
    const seed = createSeedAdminPromoCodes()[0]!;
    const get = jest.fn().mockResolvedValue({ data: [seed] });
    const post = jest.fn().mockResolvedValue({ data: seed });
    const put = jest.fn().mockResolvedValue({ data: seed });
    const patch = jest.fn().mockResolvedValue({ data: { ...seed, active: false } });
    const del = jest.fn().mockResolvedValue({ data: undefined });
    const client = { get, post, put, patch, delete: del } as unknown as AxiosInstance;
    const api = createHttpAdminPromoCodesApi(client);

    await api.listPromoCodes({
      search: 'SAVE',
      discountType: 'PERCENT',
      active: 'active',
    });
    expect(get).toHaveBeenCalledWith('/admin/promo-codes', {
      params: {
        search: 'SAVE',
        discountType: 'PERCENT',
        active: 'active',
      },
    });

    get.mockResolvedValueOnce({ data: seed });
    await api.getPromoCode('promo/1');
    expect(get).toHaveBeenCalledWith('/admin/promo-codes/promo%2F1');

    await api.createPromoCode(seed);
    expect(post).toHaveBeenCalledWith('/admin/promo-codes', seed);

    await api.updatePromoCode('promo-1', seed);
    expect(put).toHaveBeenCalledWith('/admin/promo-codes/promo-1', seed);

    await api.setPromoCodeActive('promo-1', false);
    expect(patch).toHaveBeenCalledWith('/admin/promo-codes/promo-1/active', { active: false });

    await api.deletePromoCode('promo-1');
    expect(del).toHaveBeenCalledWith('/admin/promo-codes/promo-1');
  });

  it('uses the shared apiClient when no client is injected', async () => {
    const seed = createSeedAdminPromoCodes()[0]!;
    const get = jest.spyOn(apiClient, 'get').mockResolvedValue({ data: [seed] });
    const api = createHttpAdminPromoCodesApi();
    const data = await api.listPromoCodes({
      search: 'FLIGHT',
      discountType: '',
      active: '',
    });

    expect(get).toHaveBeenCalledWith('/admin/promo-codes', {
      params: { search: 'FLIGHT' },
    });
    expect(data).toEqual([seed]);
  });
});
