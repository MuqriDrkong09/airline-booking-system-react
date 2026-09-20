import { AppSelect } from '@/components/common';
import type { FlightSortOption } from '../../types/flight';

export interface FlightSortProps {
  value: FlightSortOption;
  onChange: (value: FlightSortOption) => void;
  disabled?: boolean;
}

const SORT_OPTIONS: ReadonlyArray<{ value: FlightSortOption; label: string }> = [
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'duration_asc', label: 'Duration: shortest' },
  { value: 'departure_asc', label: 'Departure: earliest' },
  { value: 'arrival_asc', label: 'Arrival: earliest' },
];

export function FlightSort({ value, onChange, disabled = false }: FlightSortProps) {
  return (
    <AppSelect
      id="flight-sort"
      label="Sort by"
      options={SORT_OPTIONS}
      value={value}
      disabled={disabled}
      onChange={(next) => onChange(next)}
      sx={{ minWidth: { sm: 220 } }}
    />
  );
}
