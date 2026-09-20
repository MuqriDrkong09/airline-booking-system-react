import Typography from '@mui/material/Typography';
import { formatPrice } from '../../utils/flightResults';

export interface FlightPriceProps {
  amount: number;
  currency: string;
  caption?: string;
}

export function FlightPrice({ amount, currency, caption = 'total' }: FlightPriceProps) {
  return (
    <Typography component="div" sx={{ lineHeight: 1.2 }}>
      <Typography
        component="span"
        variant="h5"
        sx={{ fontWeight: 700, color: 'primary.main', display: 'block' }}
      >
        {formatPrice(amount, currency)}
      </Typography>
      <Typography component="span" variant="caption" color="text.secondary">
        {caption}
      </Typography>
    </Typography>
  );
}
