import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { AppButton, AppInput, AppSelect } from '@/components/common';
import {
  ADMIN_SEAT_TYPE_OPTIONS,
  CABIN_CLASS_OPTIONS,
} from '../../constants/seatTypes';
import type { AdminSeatType, AircraftCabinClass } from '../../types/adminAircraft';
import { formatColumnLayout } from '../../utils/seatMapConfig';

export interface AircraftSeatLayoutControlsProps {
  rows: number;
  columns: readonly string[];
  paintType: AdminSeatType | '';
  defaultCabinClass: AircraftCabinClass;
  onRowsChange: (rows: number) => void;
  onColumnsChange: (columnsInput: string) => void;
  onPaintTypeChange: (paintType: AdminSeatType | '') => void;
  onDefaultCabinClassChange: (cabinClass: AircraftCabinClass) => void;
  onApplyLayout: () => void;
  onResetLayout: () => void;
}

export function AircraftSeatLayoutControls({
  rows,
  columns,
  paintType,
  defaultCabinClass,
  onRowsChange,
  onColumnsChange,
  onPaintTypeChange,
  onDefaultCabinClassChange,
  onApplyLayout,
  onResetLayout,
}: AircraftSeatLayoutControlsProps) {
  return (
    <Stack spacing={2} component="section" aria-label="Seat map layout controls">
      <Typography variant="subtitle2">Layout</Typography>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <AppInput
          label="Rows"
          type="number"
          value={rows}
          onChange={(event) => onRowsChange(Number(event.target.value) || 1)}
          slotProps={{ htmlInput: { min: 1, max: 80, step: 1 } }}
        />
        <AppInput
          label="Columns"
          value={formatColumnLayout(columns)}
          onChange={(event) => onColumnsChange(event.target.value)}
          helperText="Letters with optional aisle markers, e.g. A B C | D E F"
        />
      </Stack>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <AppSelect
          label="Default cabin class"
          options={CABIN_CLASS_OPTIONS}
          value={defaultCabinClass}
          onChange={(value) => onDefaultCabinClassChange(value as AircraftCabinClass)}
        />
        <AppSelect
          label="Paint seat type"
          options={[{ value: '', label: 'Select seats to edit' }, ...ADMIN_SEAT_TYPE_OPTIONS]}
          value={paintType}
          onChange={(value) => onPaintTypeChange(value as AdminSeatType | '')}
          helperText="Optional: click seats to apply this type"
        />
      </Stack>

      <Stack direction="row" spacing={1.5} useFlexGap sx={{ flexWrap: 'wrap' }}>
        <AppButton variant="contained" onClick={onApplyLayout}>
          Apply layout
        </AppButton>
        <AppButton variant="outlined" color="inherit" onClick={onResetLayout}>
          Reset to cabin defaults
        </AppButton>
      </Stack>
    </Stack>
  );
}
