import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {
  ADMIN_SEAT_TYPES,
  ADMIN_SEAT_TYPE_COLORS,
  ADMIN_SEAT_TYPE_LABELS,
} from '../../constants/seatTypes';

export function AircraftSeatTypeLegend() {
  return (
    <Stack
      component="ul"
      direction="row"
      spacing={1.5}
      useFlexGap
      sx={{ m: 0, p: 0, listStyle: 'none', flexWrap: 'wrap' }}
      aria-label="Seat type legend"
    >
      {ADMIN_SEAT_TYPES.map((seatType) => {
        const colors = ADMIN_SEAT_TYPE_COLORS[seatType];
        return (
          <Stack
            key={seatType}
            component="li"
            direction="row"
            spacing={0.75}
            sx={{ alignItems: 'center' }}
          >
            <Box
              aria-hidden
              sx={{
                width: 16,
                height: 16,
                borderRadius: 0.5,
                border: '2px solid',
                borderColor: colors.border,
                bgcolor: colors.bg,
              }}
            />
            <Typography variant="caption" color="text.secondary">
              {ADMIN_SEAT_TYPE_LABELS[seatType]}
            </Typography>
          </Stack>
        );
      })}
    </Stack>
  );
}
