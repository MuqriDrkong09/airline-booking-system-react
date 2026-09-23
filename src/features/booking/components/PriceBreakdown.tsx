import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { AppCard } from '@/components/common';
import type { BookingPriceBreakdown } from '../types/booking';
import { formatBookingMoney } from '../utils/formatMoney';

export interface PriceBreakdownProps {
  breakdown: BookingPriceBreakdown;
  promoCode?: string | null;
}

function Line({
  label,
  value,
  emphasize,
  muted,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
  muted?: boolean;
}) {
  return (
    <Stack direction="row" sx={{ justifyContent: 'space-between', gap: 2 }}>
      <Typography
        variant={emphasize ? 'subtitle1' : 'body2'}
        color={muted ? 'text.secondary' : 'text.primary'}
        sx={emphasize ? { fontWeight: 700 } : undefined}
      >
        {label}
      </Typography>
      <Typography
        variant={emphasize ? 'subtitle1' : 'body2'}
        sx={emphasize ? { fontWeight: 700 } : undefined}
      >
        {value}
      </Typography>
    </Stack>
  );
}

export function PriceBreakdown({ breakdown, promoCode }: PriceBreakdownProps) {
  const { currency } = breakdown;

  return (
    <AppCard title="Price breakdown" subtitle="Fare, extras, taxes, and total due.">
      <Stack spacing={1}>
        <Line label="Fare" value={formatBookingMoney(breakdown.baseFare, currency)} muted />
        <Line label="Seats" value={formatBookingMoney(breakdown.seatCost, currency)} muted />
        <Line label="Baggage" value={formatBookingMoney(breakdown.baggageCost, currency)} muted />
        <Line label="Meals" value={formatBookingMoney(breakdown.mealCost, currency)} muted />
        <Line label="Add-ons" value={formatBookingMoney(breakdown.addonCost, currency)} muted />
        <Divider />
        <Line label="Subtotal" value={formatBookingMoney(breakdown.subtotal, currency)} />
        <Line
          label={promoCode ? `Discount (${promoCode})` : 'Discount'}
          value={
            breakdown.discount > 0
              ? `−${formatBookingMoney(breakdown.discount, currency)}`
              : formatBookingMoney(0, currency)
          }
          muted
        />
        <Line label="Taxes" value={formatBookingMoney(breakdown.taxes, currency)} muted />
        <Divider />
        <Line
          label="Total"
          value={formatBookingMoney(breakdown.finalTotal, currency)}
          emphasize
        />
      </Stack>
    </AppCard>
  );
}
