import type { AxiosInstance } from 'axios';
import { apiClient } from '@/services/api/client';
import type {
  AdminPromoCode,
  AdminPromoCodeFilters,
  AdminPromoCodeInput,
} from '../types/adminPromoCode';
import type { AdminPromoCodesApi } from './adminPromoCodesApi.types';

function toQuery(filters?: AdminPromoCodeFilters): Record<string, string> | undefined {
  if (!filters) {
    return undefined;
  }

  const params: Record<string, string> = {};
  if (filters.search.trim()) params.search = filters.search.trim();
  if (filters.discountType) params.discountType = filters.discountType;
  if (filters.active) params.active = filters.active;
  return Object.keys(params).length > 0 ? params : undefined;
}

export function createHttpAdminPromoCodesApi(
  client: AxiosInstance = apiClient,
): AdminPromoCodesApi {
  return {
    async listPromoCodes(filters?: AdminPromoCodeFilters): Promise<AdminPromoCode[]> {
      const { data } = await client.get<AdminPromoCode[]>('/admin/promo-codes', {
        params: toQuery(filters),
      });
      return data;
    },
    async getPromoCode(promoId: string): Promise<AdminPromoCode> {
      const { data } = await client.get<AdminPromoCode>(
        `/admin/promo-codes/${encodeURIComponent(promoId)}`,
      );
      return data;
    },
    async createPromoCode(input: AdminPromoCodeInput): Promise<AdminPromoCode> {
      const { data } = await client.post<AdminPromoCode>('/admin/promo-codes', input);
      return data;
    },
    async updatePromoCode(
      promoId: string,
      input: AdminPromoCodeInput,
    ): Promise<AdminPromoCode> {
      const { data } = await client.put<AdminPromoCode>(
        `/admin/promo-codes/${encodeURIComponent(promoId)}`,
        input,
      );
      return data;
    },
    async setPromoCodeActive(promoId: string, active: boolean): Promise<AdminPromoCode> {
      const { data } = await client.patch<AdminPromoCode>(
        `/admin/promo-codes/${encodeURIComponent(promoId)}/active`,
        { active },
      );
      return data;
    },
    async deletePromoCode(promoId: string): Promise<void> {
      await client.delete(`/admin/promo-codes/${encodeURIComponent(promoId)}`);
    },
  };
}
