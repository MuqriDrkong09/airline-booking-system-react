import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { AppBadge, AppCard } from '@/components/common';
import {
  formatBookingMoney,
  type BookingPriceBreakdown,
  type PaymentMethod,
} from '@/features/booking';
import { PAYMENT_METHOD_LABELS } from '../constants/paymentMethods';

export interface PaymentSummaryProps {
  breakdown: BookingPriceBreakdown;
  method: PaymentMethod;
  flightLabel?: string | null;
  passengerCount?: number;
}

export function PaymentSummary({
  breakdown,
  method,
  flightLabel,
  passengerCount = 0,
}: PaymentSummaryProps) {
  const { currency } = breakdown;

  return (
    <AppCard title="Payment summary" subtitle="Amount due for this booking.">
      <Stack spacing={1.25}>
        {flightLabel ? (
          <Typography variant="body2" color="text.secondary">
            {flightLabel}
          </Typography>
        ) : null}
        {passengerCount > 0 ? (
          <Typography variant="body2" color="text.secondary">
            {passengerCount} passenger{passengerCount === 1 ? '' : 's'}
          </Typography>
        ) : null}

        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Method
          </Typography>
          <AppBadge label={PAYMENT_METHOD_LABELS[method]} tone="info" size="small" />
        </Stack>

        <Divider />

        <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
          <Typography variant="body2" color="text.secondary">
            Subtotal
          </Typography>
          <Typography variant="body2">
            {formatBookingMoney(breakdown.subtotal, currency)}
          </Typography>
        </Stack>
        <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
          <Typography variant="body2" color="text.secondary">
            Discount
          </Typography>
          <Typography variant="body2">
            {breakdown.discount > 0
              ? `−${formatBookingMoney(breakdown.discount, currency)}`
              : formatBookingMoney(0, currency)}
          </Typography>
        </Stack>
        <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
          <Typography variant="body2" color="text.secondary">
            Taxes
          </Typography>
          <Typography variant="body2">
            {formatBookingMoney(breakdown.taxes, currency)}
          </Typography>
        </Stack>
        <Divider />
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Total due
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {formatBookingMoney(breakdown.finalTotal, currency)}
          </Typography>
        </Stack>
      </Stack>
    </AppCard>
  );
}
