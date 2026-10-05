import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { AppButton, AppInput, AppSelect } from '@/components/common';
import { STATUS_FILTER_OPTIONS } from '../constants/options';
import {
  EMPTY_ADMIN_BOOKING_QUERY,
  type AdminBookingListQuery,
} from '../types/adminBooking';
import type { BookingRecordStatus } from '@/features/booking';

export interface BookingFiltersProps {
  value: AdminBookingListQuery;
  flightOptions: readonly string[];
  onChange: (value: AdminBookingListQuery) => void;
}

export function BookingFilters({ value, flightOptions, onChange }: BookingFiltersProps) {
  const update = (patch: Partial<AdminBookingListQuery>) => {
    onChange({ ...value, ...patch, page: 1 });
  };

  const flightSelectOptions = [
    { value: '', label: 'All flights' },
    ...flightOptions.map((flight) => ({ value: flight, label: flight })),
  ];

  return (
    <Stack component="section" aria-label="Booking filters" spacing={2}>
      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: {
            xs: '1fr',
            md: 'repeat(2, minmax(0, 1fr))',
            lg: '2fr repeat(4, minmax(0, 1fr))',
          },
          alignItems: { xs: 'stretch', lg: 'end' },
        }}
      >
        <AppInput
          label="Search"
          value={value.search}
          onChange={(event) => update({ search: event.target.value })}
          placeholder="Reference, passenger, route…"
        />
        <AppSelect
          label="Status"
          options={STATUS_FILTER_OPTIONS}
          value={value.status}
          onChange={(status) => update({ status: status as '' | BookingRecordStatus })}
        />
        <AppSelect
          label="Flight"
          options={flightSelectOptions}
          value={value.flight}
          onChange={(flight) => update({ flight })}
        />
        <AppInput
          label="From date"
          type="date"
          value={value.dateFrom}
          onChange={(event) => update({ dateFrom: event.target.value })}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <AppInput
          label="To date"
          type="date"
          value={value.dateTo}
          onChange={(event) => update({ dateTo: event.target.value })}
          slotProps={{ inputLabel: { shrink: true } }}
        />
      </Box>
      <Stack direction="row" sx={{ justifyContent: { xs: 'stretch', lg: 'flex-end' } }}>
        <AppButton
          variant="outlined"
          color="inherit"
          onClick={() =>
            onChange({
              ...EMPTY_ADMIN_BOOKING_QUERY,
              pageSize: value.pageSize,
            })
          }
          fullWidth
          sx={{ width: { lg: 'auto' }, minWidth: { lg: 140 } }}
        >
          Clear
        </AppButton>
      </Stack>
    </Stack>
  );
}
