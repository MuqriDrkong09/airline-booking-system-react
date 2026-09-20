import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import { AppButton, AppCard } from '@/components/common';
import type { FlightOffer } from '../../types/flight';
import { BaggageInfo } from './BaggageInfo';
import { FareDetails } from './FareDetails';
import { FlightDetailsHeader } from './FlightDetailsHeader';
import { FlightPolicies } from './FlightPolicies';
import { FlightTimeline } from './FlightTimeline';

export interface FlightDetailsProps {
  flight: FlightOffer;
  onSelectFlight?: (flight: FlightOffer) => void;
  selectPending?: boolean;
}

export function FlightDetails({
  flight,
  onSelectFlight,
  selectPending = false,
}: FlightDetailsProps) {
  return (
    <Stack spacing={2.5}>
      <AppCard
        outlined
        sx={{
          '& .MuiCardContent-root': {
            p: { xs: 2, sm: 2.5 },
            display: 'flex',
            flexDirection: 'column',
            gap: 2.5,
            '&:last-child': { pb: { xs: 2, sm: 2.5 } },
          },
        }}
      >
        <FlightDetailsHeader flight={flight} />
        <Divider />
        <FlightTimeline flight={flight} />
      </AppCard>

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        sx={{ alignItems: 'stretch' }}
      >
        <AppCard
          outlined
          sx={{
            flex: 1,
            minWidth: 0,
            '& .MuiCardContent-root': {
              p: { xs: 2, sm: 2.5 },
              '&:last-child': { pb: { xs: 2, sm: 2.5 } },
            },
          }}
        >
          <FareDetails flight={flight} />
        </AppCard>

        <AppCard
          outlined
          sx={{
            flex: 1,
            minWidth: 0,
            '& .MuiCardContent-root': {
              p: { xs: 2, sm: 2.5 },
              display: 'flex',
              flexDirection: 'column',
              gap: 2.5,
              '&:last-child': { pb: { xs: 2, sm: 2.5 } },
            },
          }}
        >
          <BaggageInfo flight={flight} />
          <Divider />
          <FlightPolicies flight={flight} />
        </AppCard>
      </Stack>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        sx={{ justifyContent: 'flex-end', alignItems: { sm: 'center' } }}
      >
        <AppButton
          variant="contained"
          size="large"
          disabled={selectPending || flight.availableSeats <= 0}
          onClick={() => onSelectFlight?.(flight)}
          sx={{ minWidth: { sm: 180 } }}
        >
          Select Flight
        </AppButton>
      </Stack>
    </Stack>
  );
}
