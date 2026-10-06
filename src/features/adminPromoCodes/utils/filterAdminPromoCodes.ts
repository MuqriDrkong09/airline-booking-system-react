import type { AdminPromoCode, AdminPromoCodeFilters } from '../types/adminPromoCode';

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

export function filterAdminPromoCodes(
  promos: readonly AdminPromoCode[],
  filters: AdminPromoCodeFilters,
): AdminPromoCode[] {
  const search = normalize(filters.search);

  return promos.filter((promo) => {
    if (filters.discountType && promo.discountType !== filters.discountType) {
      return false;
    }

    if (filters.active === 'active' && !promo.active) {
      return false;
    }
    if (filters.active === 'inactive' && promo.active) {
      return false;
    }

    if (!search) {
      return true;
    }

    const haystack = [promo.code, promo.description, promo.discountType].join(' ').toLowerCase();
    return haystack.includes(search);
  });
}

export function sortAdminPromoCodes(promos: readonly AdminPromoCode[]): AdminPromoCode[] {
  return [...promos].sort((left, right) => left.code.localeCompare(right.code));
}
