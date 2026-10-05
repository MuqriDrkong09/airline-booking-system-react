import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useEffect, useMemo, useState } from 'react';
import { ZodError } from 'zod';
import { AppAlert, AppButton } from '@/components/common';
import type {
  AdminAircraft,
  AdminSeatType,
  AircraftCabinClass,
  AircraftConfiguredSeat,
  AircraftSeatMapConfig,
} from '../../types/adminAircraft';
import {
  applySeatType,
  buildDefaultSeatMapConfig,
  buildSeatsFromLayout,
  ensureSeatMapConfig,
  parseColumnLayout,
  syncSeatMapConfig,
  validateSeatMapConfig,
} from '../../utils/seatMapConfig';
import { AircraftSeatInspector } from './AircraftSeatInspector';
import { AircraftSeatLayoutControls } from './AircraftSeatLayoutControls';
import { AircraftSeatMapCanvas } from './AircraftSeatMapCanvas';
import { AircraftSeatTypeLegend } from './AircraftSeatTypeLegend';

export interface AircraftSeatMapEditorProps {
  aircraft: AdminAircraft;
  saving?: boolean;
  onSave: (config: AircraftSeatMapConfig) => void | Promise<void>;
  onCancel: () => void;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof ZodError) {
    return error.issues.map((issue) => issue.message).slice(0, 3).join('; ');
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Seat map configuration is invalid.';
}

export function AircraftSeatMapEditor({
  aircraft,
  saving = false,
  onSave,
  onCancel,
}: AircraftSeatMapEditorProps) {
  const initialConfig = useMemo(
    () => ensureSeatMapConfig(aircraft.seatMapConfig, aircraft),
    [aircraft],
  );

  const [config, setConfig] = useState<AircraftSeatMapConfig>(initialConfig);
  const [draftRows, setDraftRows] = useState(initialConfig.rows);
  const [draftColumnsInput, setDraftColumnsInput] = useState(
    initialConfig.columns.join(' '),
  );
  const [paintType, setPaintType] = useState<AdminSeatType | ''>('');
  const [defaultCabinClass, setDefaultCabinClass] =
    useState<AircraftCabinClass>('ECONOMY');
  const [selectedSeatId, setSelectedSeatId] = useState<string | null>(
    initialConfig.seats[0]?.id ?? null,
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    const next = ensureSeatMapConfig(aircraft.seatMapConfig, aircraft);
    setConfig(next);
    setDraftRows(next.rows);
    setDraftColumnsInput(next.columns.join(' '));
    setSelectedSeatId(next.seats[0]?.id ?? null);
    setValidationError(null);
  }, [aircraft]);

  const selectedSeat =
    config.seats.find((seat) => seat.id === selectedSeatId) ?? null;

  const updateSeat = (nextSeat: AircraftConfiguredSeat) => {
    setConfig((current) =>
      syncSeatMapConfig({
        ...current,
        seats: current.seats.map((seat) => (seat.id === nextSeat.id ? nextSeat : seat)),
      }),
    );
    setSelectedSeatId(nextSeat.id);
    setValidationError(null);
  };

  const handleSelectSeat = (seatId: string) => {
    if (paintType) {
      setConfig((current) =>
        syncSeatMapConfig({
          ...current,
          seats: current.seats.map((seat) =>
            seat.id === seatId ? applySeatType(seat, paintType) : seat,
          ),
        }),
      );
    }
    setSelectedSeatId(seatId);
    setValidationError(null);
  };

  const handleApplyLayout = () => {
    try {
      const columns = parseColumnLayout(draftColumnsInput);
      const rows = Math.min(80, Math.max(1, Math.floor(draftRows) || 1));
      const seats = buildSeatsFromLayout({
        rows,
        columns,
        cabinClass: defaultCabinClass,
        previousSeats: config.seats,
      });
      const next = syncSeatMapConfig({
        ...config,
        rows,
        columns,
        seats,
      });
      setConfig(next);
      setDraftRows(next.rows);
      setDraftColumnsInput(next.columns.join(' '));
      setSelectedSeatId((current) =>
        next.seats.some((seat) => seat.id === current)
          ? current
          : (next.seats[0]?.id ?? null),
      );
      setValidationError(null);
    } catch (error) {
      setValidationError(getErrorMessage(error));
    }
  };

  const handleResetLayout = () => {
    const next = buildDefaultSeatMapConfig(aircraft);
    setConfig(next);
    setDraftRows(next.rows);
    setDraftColumnsInput(next.columns.join(' '));
    setSelectedSeatId(next.seats[0]?.id ?? null);
    setPaintType('');
    setValidationError(null);
  };

  const handleSave = async () => {
    try {
      const parsed = validateSeatMapConfig({
        ...config,
        version: config.version + 1,
        notes: config.notes ?? 'Configured in admin seat-map editor.',
      });
      setValidationError(null);
      await onSave(parsed);
    } catch (error) {
      setValidationError(getErrorMessage(error));
    }
  };

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' } }}
      >
        <Box>
          <Typography variant="body2" color="text.secondary">
            {config.seats.length} seats · {config.rows} rows · version {config.version}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <AppButton color="inherit" onClick={onCancel} disabled={saving}>
            Back
          </AppButton>
          <AppButton variant="contained" loading={saving} onClick={() => void handleSave()}>
            Save seat map
          </AppButton>
        </Stack>
      </Stack>

      {validationError ? (
        <AppAlert severity="error" onClose={() => setValidationError(null)}>
          {validationError}
        </AppAlert>
      ) : null}

      <AircraftSeatLayoutControls
        rows={draftRows}
        columns={parseColumnLayout(draftColumnsInput)}
        paintType={paintType}
        defaultCabinClass={defaultCabinClass}
        onRowsChange={setDraftRows}
        onColumnsChange={setDraftColumnsInput}
        onPaintTypeChange={setPaintType}
        onDefaultCabinClassChange={setDefaultCabinClass}
        onApplyLayout={handleApplyLayout}
        onResetLayout={handleResetLayout}
      />

      <AircraftSeatTypeLegend />

      <Box
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1.4fr) minmax(280px, 1fr)' },
          alignItems: 'start',
        }}
      >
        <AircraftSeatMapCanvas
          config={config}
          selectedSeatId={selectedSeatId}
          onSelectSeat={handleSelectSeat}
        />
        <AircraftSeatInspector seat={selectedSeat} onChange={updateSeat} />
      </Box>
    </Stack>
  );
}
