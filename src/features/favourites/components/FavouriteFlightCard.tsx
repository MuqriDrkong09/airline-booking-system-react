import Stack from '@mui/material/Stack';
import { Link as RouterLink } from 'react-router-dom';
import { AppButton } from '@/components/common';
import { APP_ROUTES } from '@/constants/routes';
import { FlightCard } from '@/features/flights/components/results/FlightCard';
import type { FlightOffer } from '@/features/flights';
import { useRemoveFavouriteMutation } from '../hooks/useFavourites';

export interface FavouriteFlightCardProps {
  flight: FlightOffer;
  onSelect?: (flight: FlightOffer) => void;
}

export function FavouriteFlightCard({ flight, onSelect }: FavouriteFlightCardProps) {
  const removeFavourite = useRemoveFavouriteMutation();

  return (
    <Stack spacing={1}>
      <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end', flexWrap: 'wrap' }}>
        <AppButton
          size="small"
          variant="text"
          color="inherit"
          loading={removeFavourite.isPending && removeFavourite.variables === flight.id}
          loadingLabel="Removing"
          onClick={() => removeFavourite.mutate(flight.id)}
        >
          Remove
        </AppButton>
        <AppButton
          size="small"
          variant="outlined"
          component={RouterLink}
          to={APP_ROUTES.customer.flightDetails(flight.id)}
        >
          View details
        </AppButton>
      </Stack>
      <FlightCard flight={flight} onSelect={onSelect} />
    </Stack>
  );
}
