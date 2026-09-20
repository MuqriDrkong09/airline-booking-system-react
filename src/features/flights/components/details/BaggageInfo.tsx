import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Briefcase, Luggage } from 'lucide-react';
import { AppBadge } from '@/components/common';
import type { FlightOffer } from '../../types/flight';

export interface BaggageInfoProps {
  flight: FlightOffer;
}

export function BaggageInfo({ flight }: BaggageInfoProps) {
  const { baggage } = flight;

  return (
    <Stack spacing={1.5}>
      <Typography variant="h6" component="h3" sx={{ fontWeight: 700 }}>
        Baggage allowance
      </Typography>

      <Stack direction="row" spacing={0.75} useFlexGap sx={{ flexWrap: 'wrap' }}>
        <AppBadge
          icon={<Briefcase aria-hidden="true" size={14} />}
          label={`${baggage.cabinKg}kg cabin`}
          variant="outlined"
        />
        <AppBadge
          icon={<Luggage aria-hidden="true" size={14} />}
          label={
            baggage.checkedKg > 0
              ? `${baggage.checkedKg}kg checked · ${baggage.pieces} pc`
              : 'No checked bag'
          }
          tone={baggage.checkedKg > 0 ? 'default' : 'warning'}
          variant="outlined"
        />
        {flight.baggageIncluded ? (
          <AppBadge label="Included in fare" tone="success" variant="outlined" />
        ) : (
          <AppBadge label="Purchase separately" tone="warning" variant="outlined" />
        )}
      </Stack>

      <Typography variant="body2" color="text.secondary">
        {baggage.allowanceSummary ??
          (baggage.checkedKg > 0
            ? `${baggage.pieces} checked piece${baggage.pieces === 1 ? '' : 's'} up to ${baggage.checkedKg}kg plus a ${baggage.cabinKg}kg cabin bag.`
            : `Cabin bag only (${baggage.cabinKg}kg). Checked baggage can be added during booking.`)}
      </Typography>
    </Stack>
  );
}
