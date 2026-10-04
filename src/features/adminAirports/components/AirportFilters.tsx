import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { AppButton, AppInput, AppSelect } from '@/components/common';
import { ACTIVE_FILTER_OPTIONS, COUNTRY_FILTER_OPTIONS } from '../constants/options';
import {
  EMPTY_ADMIN_AIRPORT_FILTERS,
  type AdminAirportFilters,
} from '../types/adminAirport';

export interface AirportFiltersProps {
  value: AdminAirportFilters;
  onChange: (value: AdminAirportFilters) => void;
}

export function AirportFilters({ value, onChange }: AirportFiltersProps) {
  const update = (patch: Partial<AdminAirportFilters>) => {
    onChange({ ...value, ...patch });
  };

  return (
    <Box
      component="section"
      aria-label="Airport filters"
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
        placeholder="Code, name, city, country…"
      />
      <AppSelect
        label="Country"
        options={COUNTRY_FILTER_OPTIONS}
        value={value.country}
        onChange={(country) => update({ country })}
      />
      <AppSelect
        label="Status"
        options={ACTIVE_FILTER_OPTIONS}
        value={value.active}
        onChange={(active) => update({ active: active as AdminAirportFilters['active'] })}
      />
      <Stack direction="row" sx={{ justifyContent: { xs: 'stretch', lg: 'flex-end' } }}>
        <AppButton
          variant="outlined"
          color="inherit"
          onClick={() => onChange({ ...EMPTY_ADMIN_AIRPORT_FILTERS })}
          fullWidth
          sx={{ width: { lg: 'auto' } }}
        >
          Clear
        </AppButton>
      </Stack>
    </Box>
  );
}
