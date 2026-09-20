import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {
  formatDuration,
  formatFlightDate,
  formatFlightTime,
  formatStopsLabel,
} from '../../utils/flightResults';

export interface FlightTimelineProps {
  originCode: string;
  originCity: string;
  destinationCode: string;
  destinationCity: string;
  departureTime: string;
  arrivalTime: string;
  durationMinutes: number;
  stops: number;
  stopAirports?: string[];
}

export function FlightTimeline({
  originCode,
  originCity,
  destinationCode,
  destinationCity,
  departureTime,
  arrivalTime,
  durationMinutes,
  stops,
  stopAirports = [],
}: FlightTimelineProps) {
  return (
    <Stack spacing={1.25} sx={{ width: '100%', minWidth: 0 }}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', gap: 2 }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.15 }}>
            {formatFlightTime(departureTime)}
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
            {originCode}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {originCity}
          </Typography>
        </Box>

        <Box sx={{ minWidth: 0, textAlign: 'right' }}>
          <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.15 }}>
            {formatFlightTime(arrivalTime)}
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
            {destinationCode}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {destinationCity}
          </Typography>
        </Box>
      </Stack>

      <Stack spacing={0.5} sx={{ alignItems: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          {formatDuration(durationMinutes)} · {formatStopsLabel(stops, stopAirports)}
        </Typography>
        <Box
          sx={{
            width: '100%',
            position: 'relative',
            height: 2,
            bgcolor: 'divider',
            borderRadius: 1,
            '&::before, &::after': {
              content: '""',
              position: 'absolute',
              top: '50%',
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: 'primary.main',
              transform: 'translateY(-50%)',
            },
            '&::before': { left: 0 },
            '&::after': { right: 0 },
          }}
        />
        <Typography variant="caption" color="text.secondary">
          {formatFlightDate(departureTime)}
          {formatFlightDate(arrivalTime) !== formatFlightDate(departureTime)
            ? ` → ${formatFlightDate(arrivalTime)}`
            : ''}
        </Typography>
      </Stack>
    </Stack>
  );
}
