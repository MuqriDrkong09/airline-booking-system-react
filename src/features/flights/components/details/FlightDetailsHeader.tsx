import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { SyntheticEvent } from 'react';
import { AppBadge } from '@/components/common';
import type { FlightOffer } from '../../types/flight';
import { formatCabinLabel } from '../../utils/searchParams';
import {
  formatDuration,
  formatFlightDate,
  formatStopsLabel,
} from '../../utils/flightResults';

export interface FlightDetailsHeaderProps {
  flight: FlightOffer;
}

export function FlightDetailsHeader({ flight }: FlightDetailsHeaderProps) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={2}
      sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between' }}
    >
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', minWidth: 0 }}>
        <Avatar
          variant="rounded"
          src={flight.airline.logoUrl}
          alt={`${flight.airline.name} logo`}
          sx={{
            width: 56,
            height: 56,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            fontWeight: 700,
            flexShrink: 0,
          }}
          slotProps={{
            img: {
              loading: 'lazy',
              onError: (event: SyntheticEvent<HTMLImageElement>) => {
                event.currentTarget.style.display = 'none';
              },
            },
          }}
        >
          {flight.airline.code}
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 700 }} noWrap>
            {flight.airline.name}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {flight.flightNumber} · {flight.aircraft.model}
            {flight.aircraft.registration ? ` (${flight.aircraft.registration})` : ''}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
            {formatFlightDate(flight.departureTime)} · {formatDuration(flight.durationMinutes)} ·{' '}
            {formatStopsLabel(flight.stops, flight.stopAirports)}
          </Typography>
        </Box>
      </Stack>

      <Stack direction="row" spacing={0.75} useFlexGap sx={{ flexWrap: 'wrap' }}>
        <AppBadge label={formatCabinLabel(flight.cabinClass)} tone="info" variant="outlined" />
        {flight.refundable ? (
          <AppBadge label="Refundable" tone="success" variant="outlined" />
        ) : (
          <AppBadge label="Non-refundable" tone="warning" variant="outlined" />
        )}
        {flight.amenities.wifi ? (
          <AppBadge label="Wi-Fi" variant="outlined" />
        ) : (
          <AppBadge label="No Wi-Fi" variant="outlined" />
        )}
      </Stack>
    </Stack>
  );
}
