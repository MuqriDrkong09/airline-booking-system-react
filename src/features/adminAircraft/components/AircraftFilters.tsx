import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { AppButton, AppInput, AppSelect } from '@/components/common';
import { ACTIVE_FILTER_OPTIONS, MANUFACTURER_FILTER_OPTIONS } from '../constants/options';
import {
  EMPTY_ADMIN_AIRCRAFT_FILTERS,
  type AdminAircraftFilters,
} from '../types/adminAircraft';

export interface AircraftFiltersProps {
  value: AdminAircraftFilters;
  onChange: (value: AdminAircraftFilters) => void;
}

export function AircraftFilters({ value, onChange }: AircraftFiltersProps) {
  const update = (patch: Partial<AdminAircraftFilters>) => {
    onChange({ ...value, ...patch });
  };

  return (
    <Box
      component="section"
      aria-label="Aircraft filters"
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
        placeholder="Registration, model, manufacturer…"
      />
      <AppSelect
        label="Manufacturer"
        options={MANUFACTURER_FILTER_OPTIONS}
        value={value.manufacturer}
        onChange={(manufacturer) => update({ manufacturer })}
      />
      <AppSelect
        label="Status"
        options={ACTIVE_FILTER_OPTIONS}
        value={value.active}
        onChange={(active) => update({ active: active as AdminAircraftFilters['active'] })}
      />
      <Stack direction="row" sx={{ justifyContent: { xs: 'stretch', lg: 'flex-end' } }}>
        <AppButton
          variant="outlined"
          color="inherit"
          onClick={() => onChange({ ...EMPTY_ADMIN_AIRCRAFT_FILTERS })}
          fullWidth
          sx={{ width: { lg: 'auto' } }}
        >
          Clear
        </AppButton>
      </Stack>
    </Box>
  );
}
