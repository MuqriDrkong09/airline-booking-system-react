import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { AppButton, AppInput, AppSelect } from '@/components/common';
import {
  ACTIVE_FILTER_OPTIONS,
  DISCOUNT_TYPE_FILTER_OPTIONS,
} from '../constants/options';
import {
  EMPTY_ADMIN_PROMO_CODE_FILTERS,
  type AdminPromoCodeFilters,
} from '../types/adminPromoCode';

export interface PromoCodeFiltersProps {
  value: AdminPromoCodeFilters;
  onChange: (value: AdminPromoCodeFilters) => void;
}

export function PromoCodeFilters({ value, onChange }: PromoCodeFiltersProps) {
  const update = (patch: Partial<AdminPromoCodeFilters>) => {
    onChange({ ...value, ...patch });
  };

  return (
    <Box
      component="section"
      aria-label="Promo code filters"
      sx={{
        display: 'grid',
        gap: 2,
        gridTemplateColumns: {
          xs: '1fr',
          lg: '2fr repeat(2, minmax(0, 1fr)) auto',
        },
        alignItems: { xs: 'stretch', lg: 'end' },
      }}
    >
      <AppInput
        label="Search"
        value={value.search}
        onChange={(event) => update({ search: event.target.value })}
        placeholder="Code or description…"
      />
      <AppSelect
        label="Discount type"
        options={DISCOUNT_TYPE_FILTER_OPTIONS}
        value={value.discountType}
        onChange={(discountType) =>
          update({ discountType: discountType as AdminPromoCodeFilters['discountType'] })
        }
      />
      <AppSelect
        label="Status"
        options={ACTIVE_FILTER_OPTIONS}
        value={value.active}
        onChange={(active) => update({ active: active as AdminPromoCodeFilters['active'] })}
      />
      <Stack direction="row" sx={{ justifyContent: { xs: 'stretch', lg: 'flex-end' } }}>
        <AppButton
          variant="outlined"
          color="inherit"
          onClick={() => onChange({ ...EMPTY_ADMIN_PROMO_CODE_FILTERS })}
          fullWidth
          sx={{ width: { lg: 'auto' } }}
        >
          Clear
        </AppButton>
      </Stack>
    </Box>
  );
}
