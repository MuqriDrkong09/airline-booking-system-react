import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  adminPromoCodeKeys,
  createAdminPromoCode,
  deleteAdminPromoCode,
  listAdminPromoCodes,
  setAdminPromoCodeActive,
  updateAdminPromoCode,
} from '../api';
import type { AdminPromoCodeFilters, AdminPromoCodeInput } from '../types/adminPromoCode';

export function useAdminPromoCodesQuery(filters: AdminPromoCodeFilters, enabled = true) {
  return useQuery({
    queryKey: adminPromoCodeKeys.list(filters),
    queryFn: () => listAdminPromoCodes(filters),
    enabled,
  });
}

export function useCreateAdminPromoCodeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AdminPromoCodeInput) => createAdminPromoCode(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: adminPromoCodeKeys.lists() });
    },
  });
}

export function useUpdateAdminPromoCodeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      promoId,
      input,
    }: {
      promoId: string;
      input: AdminPromoCodeInput;
    }) => updateAdminPromoCode(promoId, input),
    onSuccess: async (promo) => {
      await queryClient.invalidateQueries({ queryKey: adminPromoCodeKeys.lists() });
      queryClient.setQueryData(adminPromoCodeKeys.detail(promo.id), promo);
    },
  });
}

export function useSetAdminPromoCodeActiveMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ promoId, active }: { promoId: string; active: boolean }) =>
      setAdminPromoCodeActive(promoId, active),
    onSuccess: async (promo) => {
      await queryClient.invalidateQueries({ queryKey: adminPromoCodeKeys.lists() });
      queryClient.setQueryData(adminPromoCodeKeys.detail(promo.id), promo);
    },
  });
}

export function useDeleteAdminPromoCodeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (promoId: string) => deleteAdminPromoCode(promoId),
    onSuccess: async (_void, promoId) => {
      await queryClient.invalidateQueries({ queryKey: adminPromoCodeKeys.lists() });
      queryClient.removeQueries({ queryKey: adminPromoCodeKeys.detail(promoId) });
    },
  });
}
