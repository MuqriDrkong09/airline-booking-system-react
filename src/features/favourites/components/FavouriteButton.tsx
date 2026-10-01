import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { Heart } from 'lucide-react';
import type { FlightOffer } from '@/features/flights';
import { useToggleFavourite } from '../hooks/useFavourites';

export interface FavouriteButtonProps {
  flight: FlightOffer;
  size?: 'small' | 'medium' | 'large';
}

export function FavouriteButton({ flight, size = 'medium' }: FavouriteButtonProps) {
  const { isFavourite, isPending, toggle } = useToggleFavourite(flight);
  const label = isFavourite ? 'Remove from favourites' : 'Add to favourites';

  return (
    <Tooltip title={label}>
      <span>
        <IconButton
          color={isFavourite ? 'error' : 'default'}
          size={size}
          aria-label={label}
          aria-pressed={isFavourite}
          disabled={isPending}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            toggle();
          }}
        >
          <Heart
            aria-hidden="true"
            size={size === 'small' ? 18 : 20}
            fill={isFavourite ? 'currentColor' : 'none'}
          />
        </IconButton>
      </span>
    </Tooltip>
  );
}
