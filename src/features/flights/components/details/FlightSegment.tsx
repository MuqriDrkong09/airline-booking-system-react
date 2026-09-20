import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FlightOfferSegment } from '../../types/flight';
import {
  formatDuration,
  formatFlightDate,
  formatFlightTime,
} from '../../utils/flightResults';

export interface FlightSegmentProps {
  segment: FlightOfferSegment;
  index: number;
  total: number;
}

export function FlightSegment({ segment, index, total }: FlightSegmentProps) {
  return (
    <Stack
      spacing={1.5}
      sx={{
        p: 2,
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
        bgcolor: 'background.paper',
      }}
    >
      <Stack direction="row" sx={{ justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          Segment {index + 1} of {total}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {segment.airline.name} · {segment.flightNumber} · {segment.aircraft.model}
        </Typography>
      </Stack>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ justifyContent: 'space-between' }}
      >
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.15 }}>
            {formatFlightTime(segment.departureTime)}
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {segment.origin.code}
            {segment.origin.terminal ? ` · Terminal ${segment.origin.terminal}` : ''}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            {segment.origin.airportName}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            {segment.origin.city} · {formatFlightDate(segment.departureTime)}
          </Typography>
        </Box>

        <Stack spacing={0.5} sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, minWidth: 120 }}>
          <Typography variant="caption" color="text.secondary">
            {formatDuration(segment.durationMinutes)}
          </Typography>
          <Box
            sx={{
              width: { xs: '100%', sm: 120 },
              height: 2,
              bgcolor: 'divider',
              borderRadius: 1,
              position: 'relative',
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
        </Stack>

        <Box sx={{ minWidth: 0, flex: 1, textAlign: { sm: 'right' } }}>
          <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.15 }}>
            {formatFlightTime(segment.arrivalTime)}
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {segment.destination.code}
            {segment.destination.terminal ? ` · Terminal ${segment.destination.terminal}` : ''}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            {segment.destination.airportName}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            {segment.destination.city} · {formatFlightDate(segment.arrivalTime)}
          </Typography>
        </Box>
      </Stack>
    </Stack>
  );
}
