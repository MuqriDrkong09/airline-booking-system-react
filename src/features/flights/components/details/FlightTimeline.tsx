import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FlightOffer } from '../../types/flight';
import {
  formatDuration,
  formatFlightDate,
  formatFlightTime,
  formatStopsLabel,
} from '../../utils/flightResults';
import { FlightSegment } from './FlightSegment';

export interface FlightDetailsTimelineProps {
  flight: FlightOffer;
}

/**
 * Detailed itinerary timeline for the flight details page.
 * (Search result cards continue to use `components/results/FlightTimeline`.)
 */
export function FlightTimeline({ flight }: FlightDetailsTimelineProps) {
  const segments = flight.segments.length
    ? flight.segments
    : [
        {
          id: `${flight.id}-seg-1`,
          flightNumber: flight.flightNumber,
          airline: flight.airline,
          aircraft: flight.aircraft,
          origin: flight.origin,
          destination: flight.destination,
          departureTime: flight.departureTime,
          arrivalTime: flight.arrivalTime,
          durationMinutes: flight.durationMinutes,
        },
      ];

  return (
    <Stack spacing={2}>
      <Stack spacing={0.5}>
        <Typography variant="h6" component="h3" sx={{ fontWeight: 700 }}>
          Itinerary
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {flight.origin.code} → {flight.destination.code} · {formatFlightTime(flight.departureTime)}–
          {formatFlightTime(flight.arrivalTime)} · {formatDuration(flight.durationMinutes)} ·{' '}
          {formatStopsLabel(flight.stops, flight.stopAirports)}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {flight.origin.airportName}
          {flight.origin.terminal ? ` (Terminal ${flight.origin.terminal})` : ''} →{' '}
          {flight.destination.airportName}
          {flight.destination.terminal ? ` (Terminal ${flight.destination.terminal})` : ''} ·{' '}
          {formatFlightDate(flight.departureTime)}
        </Typography>
      </Stack>

      <Stack spacing={1.5}>
        {segments.map((segment, index) => (
          <FlightSegment
            key={segment.id}
            segment={segment}
            index={index}
            total={segments.length}
          />
        ))}
      </Stack>
    </Stack>
  );
}
