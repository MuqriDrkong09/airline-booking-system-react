import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import { AppInput, AppSelect } from '@/components/common';
import {
  ADMIN_SEAT_TYPE_OPTIONS,
  CABIN_CLASS_OPTIONS,
} from '../../constants/seatTypes';
import type {
  AdminSeatType,
  AircraftCabinClass,
  AircraftConfiguredSeat,
} from '../../types/adminAircraft';

export interface AircraftSeatInspectorProps {
  seat: AircraftConfiguredSeat | null;
  onChange: (seat: AircraftConfiguredSeat) => void;
}

export function AircraftSeatInspector({ seat, onChange }: AircraftSeatInspectorProps) {
  if (!seat) {
    return (
      <Stack spacing={1} component="section" aria-label="Selected seat">
        <Typography variant="subtitle2">Selected seat</Typography>
        <Typography variant="body2" color="text.secondary">
          Click a seat on the map to edit its label, cabin class, type, price, and flags.
        </Typography>
      </Stack>
    );
  }

  const update = (patch: Partial<AircraftConfiguredSeat>) => {
    let next: AircraftConfiguredSeat = { ...seat, ...patch };

    if (patch.seatType === 'EMERGENCY_EXIT') {
      next = { ...next, emergencyExit: true };
    }
    if (patch.seatType === 'UNAVAILABLE') {
      next = { ...next, disabled: true };
    }
    if (patch.emergencyExit === true && next.seatType === 'STANDARD') {
      next = { ...next, seatType: 'EMERGENCY_EXIT' };
    }
    if (patch.disabled === true && next.seatType === 'STANDARD') {
      next = { ...next, seatType: 'UNAVAILABLE' };
    }
    if (patch.emergencyExit === false && next.seatType === 'EMERGENCY_EXIT') {
      next = { ...next, seatType: 'STANDARD' };
    }
    if (patch.disabled === false && next.seatType === 'UNAVAILABLE') {
      next = { ...next, seatType: 'STANDARD' };
    }

    onChange(next);
  };

  return (
    <Stack spacing={2} component="section" aria-label="Selected seat">
      <Typography variant="subtitle2">Selected seat · {seat.label}</Typography>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <AppInput
          label="Seat label"
          value={seat.label}
          onChange={(event) => update({ label: event.target.value.toUpperCase() })}
        />
        <AppInput
          label="Row"
          type="number"
          value={seat.row}
          onChange={(event) => update({ row: Number(event.target.value) || 1 })}
          slotProps={{ htmlInput: { min: 1, max: 80, step: 1 } }}
        />
        <AppInput
          label="Column"
          value={seat.column}
          onChange={(event) => update({ column: event.target.value.toUpperCase().slice(0, 1) })}
          slotProps={{ htmlInput: { maxLength: 1 } }}
        />
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <AppSelect
          label="Cabin class"
          options={CABIN_CLASS_OPTIONS}
          value={seat.cabinClass}
          onChange={(value) => update({ cabinClass: value as AircraftCabinClass })}
        />
        <AppSelect
          label="Seat type"
          options={ADMIN_SEAT_TYPE_OPTIONS}
          value={seat.seatType}
          onChange={(value) => update({ seatType: value as AdminSeatType })}
        />
        <AppInput
          label="Price"
          type="number"
          value={seat.price}
          onChange={(event) => update({ price: Number(event.target.value) || 0 })}
          slotProps={{ htmlInput: { min: 0, max: 10000, step: 1 } }}
        />
      </Stack>

      <Stack direction="row" spacing={2} useFlexGap sx={{ flexWrap: 'wrap' }}>
        <FormControlLabel
          control={
            <Switch
              checked={seat.emergencyExit}
              onChange={(_, checked) => update({ emergencyExit: checked })}
              slotProps={{ input: { 'aria-label': 'Emergency exit' } }}
            />
          }
          label="Emergency exit"
        />
        <FormControlLabel
          control={
            <Switch
              checked={seat.disabled}
              onChange={(_, checked) => update({ disabled: checked })}
              slotProps={{ input: { 'aria-label': 'Disabled seat' } }}
            />
          }
          label="Disabled seat"
        />
      </Stack>
    </Stack>
  );
}
