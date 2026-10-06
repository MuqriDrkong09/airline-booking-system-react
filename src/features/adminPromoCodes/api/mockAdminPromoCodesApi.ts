import type {
  AdminPromoCode,
  AdminPromoCodeFilters,
  AdminPromoCodeInput,
} from '../types/adminPromoCode';
import { filterAdminPromoCodes, sortAdminPromoCodes } from '../utils/filterAdminPromoCodes';
import { cloneAdminPromoCode } from '../utils/formatAdminPromoCode';
import type { AdminPromoCodesApi } from './adminPromoCodesApi.types';
import { createSeedAdminPromoCodes } from './adminPromoCodesData';

const MOCK_DELAY_MS = process.env.NODE_ENV === 'test' ? 0 : 250;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function normalizeCode(code: string): string {
  return code.trim().toUpperCase();
}

export function createMockAdminPromoCodesApi(
  options: { delayMs?: number; initialPromoCodes?: AdminPromoCode[] } = {},
): AdminPromoCodesApi & {
  reset: () => void;
  getState: () => AdminPromoCode[];
} {
  const delayMs = options.delayMs ?? MOCK_DELAY_MS;
  let promos = (options.initialPromoCodes ?? createSeedAdminPromoCodes()).map(cloneAdminPromoCode);
  let nextId = promos.length + 1;

  return {
    reset() {
      promos = (options.initialPromoCodes ?? createSeedAdminPromoCodes()).map(cloneAdminPromoCode);
      nextId = promos.length + 1;
    },
    getState() {
      return promos.map(cloneAdminPromoCode);
    },
    async listPromoCodes(filters?: AdminPromoCodeFilters): Promise<AdminPromoCode[]> {
      await delay(delayMs);
      const source = sortAdminPromoCodes(promos.map(cloneAdminPromoCode));
      if (!filters) {
        return source;
      }
      return filterAdminPromoCodes(source, filters);
    },
    async getPromoCode(promoId: string): Promise<AdminPromoCode> {
      await delay(delayMs);
      const promo = promos.find((item) => item.id === promoId);
      if (!promo) {
        throw new Error('Promo code not found');
      }
      return cloneAdminPromoCode(promo);
    },
    async createPromoCode(input: AdminPromoCodeInput): Promise<AdminPromoCode> {
      await delay(delayMs);
      const code = normalizeCode(input.code);
      if (promos.some((item) => item.code === code)) {
        throw new Error('A promo code with this code already exists');
      }
      const now = new Date().toISOString();
      const created: AdminPromoCode = {
        ...input,
        code,
        id: `promo-admin-${nextId}`,
        usedCount: 0,
        createdAt: now,
        updatedAt: now,
      };
      nextId += 1;
      promos = [created, ...promos];
      return cloneAdminPromoCode(created);
    },
    async updatePromoCode(
      promoId: string,
      input: AdminPromoCodeInput,
    ): Promise<AdminPromoCode> {
      await delay(delayMs);
      const index = promos.findIndex((item) => item.id === promoId);
      if (index < 0) {
        throw new Error('Promo code not found');
      }
      const code = normalizeCode(input.code);
      if (promos.some((item, itemIndex) => itemIndex !== index && item.code === code)) {
        throw new Error('A promo code with this code already exists');
      }
      const current = promos[index]!;
      const updated: AdminPromoCode = {
        ...current,
        ...input,
        code,
        id: promoId,
        usedCount: current.usedCount,
        createdAt: current.createdAt,
        updatedAt: new Date().toISOString(),
      };
      promos = promos.map((item, itemIndex) => (itemIndex === index ? updated : item));
      return cloneAdminPromoCode(updated);
    },
    async setPromoCodeActive(promoId: string, active: boolean): Promise<AdminPromoCode> {
      await delay(delayMs);
      const index = promos.findIndex((item) => item.id === promoId);
      if (index < 0) {
        throw new Error('Promo code not found');
      }
      const updated: AdminPromoCode = {
        ...promos[index]!,
        active,
        updatedAt: new Date().toISOString(),
      };
      promos = promos.map((item, itemIndex) => (itemIndex === index ? updated : item));
      return cloneAdminPromoCode(updated);
    },
    async deletePromoCode(promoId: string): Promise<void> {
      await delay(delayMs);
      const exists = promos.some((item) => item.id === promoId);
      if (!exists) {
        throw new Error('Promo code not found');
      }
      promos = promos.filter((item) => item.id !== promoId);
    },
  };
}

export const mockAdminPromoCodesApi = createMockAdminPromoCodesApi();
