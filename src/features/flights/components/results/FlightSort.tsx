import { memo } from 'react';
import { AppSelect } from '@/components/common';
import { FLIGHT_SORT_SELECT_OPTIONS, type FlightSortOption } from '../../types/flight';

export interface FlightSortProps {
  value: FlightSortOption;
  onChange: (value: FlightSortOption) => void;
  disabled?: boolean;
  fullWidth?: boolean;
  id?: string;
  label?: string;
}

function FlightSortComponent({
  value,
  onChange,
  disabled = false,
  fullWidth = true,
  id = 'flight-sort',
  label = 'Sort by',
}: FlightSortProps) {
  return (
    <AppSelect
      id={id}
      label={label}
      options={FLIGHT_SORT_SELECT_OPTIONS}
      value={value}
      disabled={disabled}
      fullWidth={fullWidth}
      onChange={(next) => onChange(next)}
      sx={{ minWidth: { sm: 220 } }}
    />
  );
}

export const FlightSort = memo(FlightSortComponent);
