import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { AppBadge } from '@/components/common';
import {
  formatCabinLabel,
  formatDuration,
  formatFlightDate,
  formatFlightTime,
  formatPrice,
  formatStopsLabel,
  type FlightOffer,
} from '@/features/flights';
import { SummarySection } from './SummarySection';

export interface FlightSummaryProps {
  flight: FlightOffer | null;
  editTo?: string;
}

export function FlightSummary({ flight, editTo }: FlightSummaryProps) {
  if (!flight) {
    return (
      <SummarySection
        title="Flight"
        editTo={editTo}
        empty
        emptyMessage="No flight selected. Choose a flight to continue."
      >
        {null}
      </SummarySection>
    );
  }

  return (
    <SummarySection
      title="Flight"
      subtitle={`${flight.airline.name} · ${flight.flightNumber}`}
      editTo={editTo}
    >
      <Stack spacing={1}>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
          <AppBadge label={formatCabinLabel(flight.cabinClass)} tone="info" variant="outlined" />
          <AppBadge
            label={formatStopsLabel(flight.stops, flight.stopAirports)}
            tone="default"
            variant="outlined"
          />
        </Stack>

        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          {flight.origin.code} → {flight.destination.code}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {flight.origin.city} to {flight.destination.city}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {formatFlightDate(flight.departureTime)} · {formatFlightTime(flight.departureTime)}–
          {formatFlightTime(flight.arrivalTime)} · {formatDuration(flight.durationMinutes)}
        </Typography>
        <Typography variant="body2">
          Fare {formatPrice(flight.price.amount, flight.price.currency)}
        </Typography>
      </Stack>
    </SummarySection>
  );
}
