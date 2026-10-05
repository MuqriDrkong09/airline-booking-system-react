import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { SEAT_CLASS_LABELS } from '@/features/seats/constants/seat';
import type { AircraftConfiguredSeat, AircraftSeatMapConfig } from '../../types/adminAircraft';
import { AircraftSeatCell } from './AircraftSeatCell';

export interface AircraftSeatMapCanvasProps {
  config: AircraftSeatMapConfig;
  selectedSeatId: string | null;
  onSelectSeat: (seatId: string) => void;
}

export function AircraftSeatMapCanvas({
  config,
  selectedSeatId,
  onSelectSeat,
}: AircraftSeatMapCanvasProps) {
  const seatsByPosition = new Map(
    config.seats.map((seat) => [`${seat.row}:${seat.column}`, seat] as const),
  );

  let lastCabinClass: AircraftConfiguredSeat['cabinClass'] | null = null;

  return (
    <Box
      role="grid"
      aria-label={`${config.layoutKey} seat map editor`}
      sx={{
        width: '100%',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        pb: 1,
      }}
    >
      <Box
        sx={{
          minWidth: { xs: 320, sm: 420 },
          mx: 'auto',
          px: { xs: 1, sm: 2 },
          py: 1.5,
          borderRadius: 2,
          bgcolor: 'action.hover',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', textAlign: 'center', mb: 1.5, letterSpacing: 1 }}
        >
          FRONT OF AIRCRAFT · {config.layoutKey}
        </Typography>

        <Stack spacing={0.25} role="rowgroup" sx={{ alignItems: 'center' }}>
          {Array.from({ length: config.rows }, (_, index) => index + 1).map((rowNumber) => {
            const rowSeats = config.columns
              .filter((token) => token !== '|')
              .map((column) => seatsByPosition.get(`${rowNumber}:${column}`))
              .filter((seat): seat is AircraftConfiguredSeat => Boolean(seat));
            const cabinClass = rowSeats[0]?.cabinClass ?? null;
            const showCabinHeader = Boolean(cabinClass && cabinClass !== lastCabinClass);
            if (cabinClass) {
              lastCabinClass = cabinClass;
            }

            return (
              <Box key={rowNumber} sx={{ width: 'fit-content' }}>
                {showCabinHeader && cabinClass ? (
                  <Typography
                    variant="overline"
                    color="primary"
                    sx={{ display: 'block', mt: 1, mb: 0.5, textAlign: 'center' }}
                  >
                    {SEAT_CLASS_LABELS[cabinClass]}
                  </Typography>
                ) : null}

                <Stack
                  direction="row"
                  spacing={{ xs: 0.5, sm: 0.75 }}
                  sx={{ alignItems: 'center', py: 0.35 }}
                  role="row"
                  aria-label={`Row ${rowNumber}`}
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ width: 28, textAlign: 'right', fontWeight: 600, flexShrink: 0 }}
                  >
                    {rowNumber}
                  </Typography>

                  {config.columns.map((cell, cellIndex) => {
                    if (cell === '|') {
                      return (
                        <Box
                          key={`aisle-${rowNumber}-${cellIndex}`}
                          aria-hidden
                          sx={{ width: { xs: 16, sm: 28 }, flexShrink: 0 }}
                        />
                      );
                    }

                    const seat = seatsByPosition.get(`${rowNumber}:${cell}`);
                    if (!seat) {
                      return (
                        <Box
                          key={`empty-${rowNumber}-${cell}`}
                          sx={{
                            width: { xs: 34, sm: 40 },
                            height: { xs: 34, sm: 40 },
                            flexShrink: 0,
                          }}
                        />
                      );
                    }

                    return (
                      <AircraftSeatCell
                        key={seat.id}
                        seat={seat}
                        selected={selectedSeatId === seat.id}
                        onSelect={onSelectSeat}
                      />
                    );
                  })}

                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ width: 28, fontWeight: 600, flexShrink: 0 }}
                  >
                    {rowNumber}
                  </Typography>
                </Stack>
              </Box>
            );
          })}
        </Stack>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', textAlign: 'center', mt: 1.5, letterSpacing: 1 }}
        >
          REAR OF AIRCRAFT
        </Typography>
      </Box>
    </Box>
  );
}
