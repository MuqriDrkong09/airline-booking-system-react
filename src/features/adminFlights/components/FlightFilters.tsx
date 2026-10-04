import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { AppButton, AppInput, AppSelect } from '@/components/common';
import {
  AIRLINE_FILTER_OPTIONS,
  AIRPORT_FILTER_OPTIONS,
  STATUS_FILTER_OPTIONS,
} from '../constants/options';
import type { AdminFlightFilters } from '../types/adminFlight';
import { EMPTY_ADMIN_FLIGHT_FILTERS } from '../types/adminFlight';

export interface FlightFiltersProps {
  value: AdminFlightFilters;
  onChange: (value: AdminFlightFilters) => void;
}

export function FlightFilters({ value, onChange }: FlightFiltersProps) {
  const update = (patch: Partial<AdminFlightFilters>) => {
    onChange({ ...value, ...patch });
  };

  return (
    <Box
      component="section"
      aria-label="Flight filters"
      sx={{
        display: 'grid',
        gap: 2,
        gridTemplateColumns: {
          xs: '1fr',
          lg: '2fr repeat(4, minmax(0, 1fr)) auto',
        },
        alignItems: { xs: 'stretch', lg: 'end' },
      }}
    >
      <AppInput
        label="Search"
        value={value.search}
        onChange={(event) => update({ search: event.target.value })}
        placeholder="Flight number, airline, route…"
      />
      <AppSelect
        label="Airline"
        options={AIRLINE_FILTER_OPTIONS}
        value={value.airline}
        onChange={(airline) => update({ airline })}
      />
      <AppSelect
        label="Origin"
        options={AIRPORT_FILTER_OPTIONS}
        value={value.origin}
        onChange={(origin) => update({ origin })}
      />
      <AppSelect
        label="Destination"
        options={AIRPORT_FILTER_OPTIONS}
        value={value.destination}
        onChange={(destination) => update({ destination })}
      />
      <AppSelect
        label="Status"
        options={STATUS_FILTER_OPTIONS}
        value={value.status}
        onChange={(status) => update({ status })}
      />
      <Stack direction="row" sx={{ justifyContent: { xs: 'stretch', lg: 'flex-end' } }}>
        <AppButton
          variant="outlined"
          color="inherit"
          onClick={() => onChange({ ...EMPTY_ADMIN_FLIGHT_FILTERS })}
          fullWidth
          sx={{ width: { lg: 'auto' } }}
        >
          Clear
        </AppButton>
      </Stack>
    </Box>
  );
}
