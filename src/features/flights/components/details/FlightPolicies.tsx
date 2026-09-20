import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FlightOffer } from '../../types/flight';

export interface FlightPoliciesProps {
  flight: FlightOffer;
}

export function FlightPolicies({ flight }: FlightPoliciesProps) {
  const { policies } = flight;

  return (
    <Stack spacing={2}>
      <Typography variant="h6" component="h3" sx={{ fontWeight: 700 }}>
        Policies
      </Typography>

      <Stack spacing={0.75}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          Refund policy
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {policies.refundPolicy}
        </Typography>
      </Stack>

      <Stack spacing={0.75}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          Change policy
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {policies.changePolicy}
        </Typography>
      </Stack>

      <Stack spacing={0.75}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          Fare conditions
        </Typography>
        <Stack component="ul" spacing={0.5} sx={{ m: 0, pl: 2.5 }}>
          {policies.fareConditions.map((condition) => (
            <Typography key={condition} component="li" variant="body2" color="text.secondary">
              {condition}
            </Typography>
          ))}
        </Stack>
      </Stack>
    </Stack>
  );
}
