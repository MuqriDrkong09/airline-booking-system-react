import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { SEAT_CLASS_LABELS, type SeatStatus } from '../constants/seat';
import type { Seat as SeatModel, SeatRowModel } from '../types/seat';
import { SeatRow } from './SeatRow';

export interface SeatMapProps {
  aircraftModel: string;
  rows: SeatRowModel[];
  getDisplayStatus: (seat: SeatModel) => SeatStatus;
  getSelectedByLabel?: (seat: SeatModel) => string | undefined;
  onSelect: (seatId: string) => void;
}

export function SeatMap({
  aircraftModel,
  rows,
  getDisplayStatus,
  getSelectedByLabel,
  onSelect,
}: SeatMapProps) {
  let lastClass: SeatRowModel['class'] | null = null;

  return (
    <Box
      role="grid"
      aria-label={`${aircraftModel} seat map`}
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
          FRONT OF AIRCRAFT · {aircraftModel}
        </Typography>

        <Stack spacing={0.25} role="rowgroup" sx={{ alignItems: 'center' }}>
          {rows.map((row) => {
            const showCabinHeader = row.class !== lastClass;
            lastClass = row.class;
            return (
              <Box key={row.row} sx={{ width: 'fit-content' }}>
                {showCabinHeader ? (
                  <Typography
                    variant="overline"
                    color="primary"
                    sx={{ display: 'block', mt: 1, mb: 0.5, textAlign: 'center' }}
                  >
                    {SEAT_CLASS_LABELS[row.class]}
                  </Typography>
                ) : null}
                <SeatRow
                  row={row}
                  getDisplayStatus={getDisplayStatus}
                  getSelectedByLabel={getSelectedByLabel}
                  onSelect={onSelect}
                />
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
