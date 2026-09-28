import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { AppInput, AppSelect } from '@/components/common';
import {
  MY_BOOKINGS_TABS,
  type MyBookingsTab,
} from '../../utils/bookingStatus';
import type { MyBookingsSort } from '../../utils/myBookingsQuery';

const SORT_OPTIONS: { label: string; value: MyBookingsSort }[] = [
  { label: 'Departure (soonest)', value: 'departure_asc' },
  { label: 'Departure (latest)', value: 'departure_desc' },
  { label: 'Newest booking', value: 'newest' },
];

export interface MyBookingsToolbarProps {
  tab: MyBookingsTab;
  counts: Record<MyBookingsTab, number>;
  search: string;
  sort: MyBookingsSort;
  onTabChange: (tab: MyBookingsTab) => void;
  onSearchChange: (value: string) => void;
  onSortChange: (value: MyBookingsSort) => void;
}

export function MyBookingsToolbar({
  tab,
  counts,
  search,
  sort,
  onTabChange,
  onSearchChange,
  onSortChange,
}: MyBookingsToolbarProps) {
  return (
    <Stack spacing={2}>
      <Tabs
        value={tab}
        onChange={(_, value: MyBookingsTab) => onTabChange(value)}
        variant="scrollable"
        scrollButtons="auto"
        aria-label="Booking status tabs"
      >
        {MY_BOOKINGS_TABS.map((item) => (
          <Tab
            key={item.id}
            value={item.id}
            label={`${item.label} (${counts[item.id]})`}
          />
        ))}
      </Tabs>

      <Box
        sx={{
          display: 'grid',
          gap: 1.5,
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'minmax(0, 1fr) 220px',
          },
        }}
      >
        <AppInput
          label="Search bookings"
          placeholder="Reference, airline, flight, or route"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          slotProps={{ htmlInput: { 'aria-label': 'Search bookings' } }}
        />
        <AppSelect
          label="Sort by"
          value={sort}
          options={SORT_OPTIONS}
          onChange={(value) => onSortChange(value)}
        />
      </Box>
    </Stack>
  );
}
