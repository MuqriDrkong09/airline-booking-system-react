import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {
  SEAT_STATUSES,
  SEAT_STATUS_COLORS,
  SEAT_STATUS_LABELS,
  type SeatStatus,
} from '../constants/seat';

export interface SeatLegendProps {
  statuses?: readonly SeatStatus[];
}

export function SeatLegend({ statuses = SEAT_STATUSES }: SeatLegendProps) {
  return (
    <Box
      component="ul"
      aria-label="Seat legend"
      sx={{
        listStyle: 'none',
        m: 0,
        p: 0,
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 1.25,
      }}
    >
      {statuses.map((status) => {
        const colors = SEAT_STATUS_COLORS[status];
        return (
          <Box
            component="li"
            key={status}
            sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}
          >
            <Box
              aria-hidden
              sx={{
                width: 18,
                height: 18,
                borderRadius: 0.75,
                border: '2px solid',
                borderColor: colors.border,
                bgcolor: colors.bg,
              }}
            />
            <Typography variant="caption" color="text.secondary">
              {SEAT_STATUS_LABELS[status]}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}
