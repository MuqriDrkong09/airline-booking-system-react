import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Briefcase, Luggage, Users } from 'lucide-react';
import type { SyntheticEvent } from 'react';
import { AppBadge, AppButton, AppCard } from '@/components/common';
import type { FlightOffer } from '../../types/flight';
import { formatCabinLabel } from '../../utils/searchParams';
import { FlightPrice } from './FlightPrice';
import { FlightTimeline } from './FlightTimeline';

export interface FlightCardProps {
  flight: FlightOffer;
  onSelect?: (flight: FlightOffer) => void;
}

export function FlightCard({ flight, onSelect }: FlightCardProps) {
  return (
    <AppCard
      outlined
      sx={{
        height: '100%',
        transition: 'border-color 120ms ease, box-shadow 120ms ease',
        '&:hover': {
          borderColor: 'primary.light',
          boxShadow: (theme) => theme.shadows[2],
        },
        '& .MuiCardContent-root': {
          p: 2,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 1.75,
          '&:last-child': { pb: 2 },
        },
      }}
    >
      <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
        <Avatar
          variant="rounded"
          src={flight.airline.logoUrl}
          alt={`${flight.airline.name} logo`}
          sx={{
            width: 44,
            height: 44,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            fontWeight: 700,
            fontSize: '0.8rem',
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
          <Typography variant="subtitle2" noWrap sx={{ fontWeight: 700 }}>
            {flight.airline.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {flight.flightNumber}
          </Typography>
        </Box>
      </Stack>

      <FlightTimeline
        originCode={flight.origin.code}
        originCity={flight.origin.city}
        destinationCode={flight.destination.code}
        destinationCity={flight.destination.city}
        departureTime={flight.departureTime}
        arrivalTime={flight.arrivalTime}
        durationMinutes={flight.durationMinutes}
        stops={flight.stops}
        stopAirports={flight.stopAirports}
      />

      <Stack direction="row" spacing={0.75} useFlexGap sx={{ flexWrap: 'wrap' }}>
        <AppBadge label={formatCabinLabel(flight.cabinClass)} tone="info" variant="outlined" />
        <AppBadge
          icon={<Luggage aria-hidden="true" size={14} />}
          label={`${flight.baggage.checkedKg}kg checked`}
          variant="outlined"
        />
        <AppBadge
          icon={<Briefcase aria-hidden="true" size={14} />}
          label={`${flight.baggage.cabinKg}kg cabin`}
          variant="outlined"
        />
        <AppBadge
          icon={<Users aria-hidden="true" size={14} />}
          label={`${flight.availableSeats} seats`}
          tone={flight.availableSeats <= 4 ? 'warning' : 'default'}
          variant="outlined"
        />
        {flight.refundable ? (
          <AppBadge label="Refundable" tone="success" variant="outlined" />
        ) : null}
        {flight.baggageIncluded ? (
          <AppBadge label="Baggage included" variant="outlined" />
        ) : (
          <AppBadge label="No checked bag" tone="warning" variant="outlined" />
        )}
      </Stack>

      <Divider />

      <Stack
        direction="row"
        spacing={1.5}
        sx={{
          mt: 'auto',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <FlightPrice amount={flight.price.amount} currency={flight.price.currency} />
        <AppButton
          variant="contained"
          onClick={() => onSelect?.(flight)}
          sx={{ flexShrink: 0, minWidth: 108 }}
        >
          Select
        </AppButton>
      </Stack>
    </AppCard>
  );
}
