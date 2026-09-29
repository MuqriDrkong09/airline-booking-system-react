import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { AppBadge } from '@/components/common';
import {
  formatCabinLabel,
  formatDuration,
  formatFlightDate,
  formatFlightTime,
  formatStopsLabel,
} from '@/features/flights';
import type { Booking } from '../../types/bookingRecord';
import { BookingDetailSection } from './BookingDetailSection';

export interface BookingFlightDetailProps {
  booking: Booking;
}

export function BookingFlightDetail({ booking }: BookingFlightDetailProps) {
  const { flight } = booking;

  return (
    <BookingDetailSection
      title="Flight"
      subtitle={`${flight.airline.name} ${flight.flightNumber}`}
    >
      <Stack spacing={1}>
        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
          <AppBadge label={formatCabinLabel(booking.cabinClass)} tone="info" variant="outlined" />
          <AppBadge
            label={formatStopsLabel(flight.stops, flight.stopAirports)}
            tone="default"
            variant="outlined"
          />
          {flight.aircraft.model ? (
            <AppBadge label={flight.aircraft.model} tone="default" variant="outlined" />
          ) : null}
        </Stack>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          {flight.origin.code} → {flight.destination.code}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {flight.origin.city} to {flight.destination.city}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {formatFlightDate(flight.departureTime)} · {formatFlightTime(flight.departureTime)}–
          {formatFlightTime(flight.arrivalTime)} · {formatDuration(flight.durationMinutes)}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {flight.origin.airportName}
          {flight.origin.terminal ? ` · Terminal ${flight.origin.terminal}` : ''}
          {' → '}
          {flight.destination.airportName}
          {flight.destination.terminal ? ` · Terminal ${flight.destination.terminal}` : ''}
        </Typography>
      </Stack>
    </BookingDetailSection>
  );
}
