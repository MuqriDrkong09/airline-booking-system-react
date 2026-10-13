import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useMemo } from 'react';
import type { SeatStatus } from '../constants/seat';
import type { SeatRowModel } from '../types/seat';
import { Seat } from './Seat';

export interface SeatRowProps {
  row: SeatRowModel;
  displayStatusBySeatId: ReadonlyMap<string, SeatStatus>;
  selectedLabelBySeatId?: ReadonlyMap<string, string>;
  onSelect: (seatId: string) => void;
}

export function SeatRow({
  row,
  displayStatusBySeatId,
  selectedLabelBySeatId,
  onSelect,
}: SeatRowProps) {
  const seatsByColumn = useMemo(
    () => new Map(row.seats.map((seat) => [seat.column, seat])),
    [row.seats],
  );

  return (
    <Stack
      direction="row"
      spacing={{ xs: 0.5, sm: 0.75 }}
      sx={{ alignItems: 'center', py: 0.35 }}
      role="group"
      aria-label={`Row ${row.row}`}
    >
      <Typography
        variant="caption"
        color="text.secondary"
        aria-hidden
        sx={{ width: 28, textAlign: 'right', fontWeight: 600, flexShrink: 0 }}
      >
        {row.row}
      </Typography>

      {row.layout.map((cell, index) => {
        if (cell === '|') {
          return (
            <Box
              key={`aisle-${row.row}-${index}`}
              aria-hidden
              sx={{ width: { xs: 16, sm: 28 }, flexShrink: 0 }}
            />
          );
        }

        const seat = seatsByColumn.get(cell);
        if (!seat) {
          return (
            <Box
              key={`empty-${row.row}-${cell}`}
              sx={{ width: { xs: 34, sm: 40 }, height: { xs: 34, sm: 40 }, flexShrink: 0 }}
            />
          );
        }

        return (
          <Seat
            key={seat.id}
            seat={seat}
            displayStatus={displayStatusBySeatId.get(seat.id) ?? seat.status}
            selectedByLabel={selectedLabelBySeatId?.get(seat.id)}
            onSelect={onSelect}
          />
        );
      })}

      <Typography
        variant="caption"
        color="text.secondary"
        aria-hidden
        sx={{ width: 28, fontWeight: 600, flexShrink: 0 }}
      >
        {row.row}
      </Typography>
    </Stack>
  );
}
