import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Wifi, WifiOff, Utensils, Armchair } from 'lucide-react';
import type { ReactNode } from 'react';
import { AppBadge } from '@/components/common';
import type { FlightOffer } from '../../types/flight';
import { formatCabinLabel } from '../../utils/searchParams';
import { FlightPrice } from '../results/FlightPrice';

export interface FareDetailsProps {
  flight: FlightOffer;
}

function AmenityRow({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Stack direction="row" spacing={1.25} sx={{ alignItems: 'flex-start' }}>
      <Stack
        sx={{
          mt: 0.25,
          color: 'text.secondary',
          flexShrink: 0,
        }}
      >
        {icon}
      </Stack>
      <Stack spacing={0.25} sx={{ minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {label}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {value}
        </Typography>
      </Stack>
    </Stack>
  );
}

export function FareDetails({ flight }: FareDetailsProps) {
  return (
    <Stack spacing={2}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        sx={{ alignItems: { sm: 'flex-end' }, justifyContent: 'space-between' }}
      >
        <Stack spacing={0.5}>
          <Typography variant="h6" component="h3" sx={{ fontWeight: 700 }}>
            Fare details
          </Typography>
          <Stack direction="row" spacing={0.75} useFlexGap sx={{ flexWrap: 'wrap' }}>
            <AppBadge label={formatCabinLabel(flight.cabinClass)} tone="info" variant="outlined" />
            <AppBadge
              label={`${flight.availableSeats} seat${flight.availableSeats === 1 ? '' : 's'} left`}
              tone={flight.availableSeats <= 4 ? 'warning' : 'default'}
              variant="outlined"
            />
          </Stack>
        </Stack>
        <FlightPrice amount={flight.price.amount} currency={flight.price.currency} />
      </Stack>

      <Stack spacing={1.5}>
        <AmenityRow
          icon={<Utensils aria-hidden="true" size={18} />}
          label="Meals"
          value={flight.amenities.meals}
        />
        <AmenityRow
          icon={
            flight.amenities.wifi ? (
              <Wifi aria-hidden="true" size={18} />
            ) : (
              <WifiOff aria-hidden="true" size={18} />
            )
          }
          label="Wi-Fi"
          value={flight.amenities.wifiNotes}
        />
        <AmenityRow
          icon={<Armchair aria-hidden="true" size={18} />}
          label="Seat information"
          value={flight.amenities.seatInformation}
        />
      </Stack>
    </Stack>
  );
}
