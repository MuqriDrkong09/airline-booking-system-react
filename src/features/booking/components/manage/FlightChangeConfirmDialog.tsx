import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FlightOffer } from '@/features/flights';
import { ConfirmDialog } from '@/components/common';
import { formatBookingMoney } from '../../utils/formatMoney';
import type { FlightChangeQuote } from '../../utils/flightChangeQuote';

export interface FlightChangeConfirmDialogProps {
  open: boolean;
  bookingReference: string;
  currentFlight: FlightOffer;
  newFlight: FlightOffer;
  quote: FlightChangeQuote;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function FlightChangeConfirmDialog({
  open,
  bookingReference,
  currentFlight,
  newFlight,
  quote,
  loading = false,
  onConfirm,
  onCancel,
}: FlightChangeConfirmDialogProps) {
  const dueLabel =
    quote.netAmountDue > 0
      ? `Additional amount due: ${formatBookingMoney(quote.netAmountDue, quote.currency)}`
      : quote.netAmountDue < 0
        ? `Refund: ${formatBookingMoney(Math.abs(quote.netAmountDue), quote.currency)}`
        : `No additional charge (${formatBookingMoney(0, quote.currency)})`;

  return (
    <ConfirmDialog
      open={open}
      title="Confirm flight change"
      confirmLabel="Apply flight change"
      cancelLabel="Keep current flight"
      confirmColor="primary"
      loading={loading}
      onConfirm={onConfirm}
      onCancel={onCancel}
      description={
        <Stack spacing={1.5}>
          <Typography variant="body2" color="text.secondary">
            Booking {bookingReference}
          </Typography>
          <Typography variant="body2">
            <strong>Current:</strong> {currentFlight.airline.name} {currentFlight.flightNumber} ·{' '}
            {currentFlight.origin.code} → {currentFlight.destination.code}
          </Typography>
          <Typography variant="body2">
            <strong>New:</strong> {newFlight.airline.name} {newFlight.flightNumber} ·{' '}
            {newFlight.origin.code} → {newFlight.destination.code}
          </Typography>
          <Divider />
          <QuoteRow
            label="Original fare"
            value={formatBookingMoney(quote.originalFare, quote.currency)}
          />
          <QuoteRow label="New fare" value={formatBookingMoney(quote.newFare, quote.currency)} />
          <QuoteRow
            label="Change fee"
            value={formatBookingMoney(quote.changeFee, quote.currency)}
          />
          <QuoteRow
            label="Fare difference"
            value={formatBookingMoney(quote.fareDifference, quote.currency)}
          />
          <Divider />
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {dueLabel}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Seat assignments will be cleared for the new aircraft. Baggage, meals, and add-ons are
            kept when possible.
          </Typography>
        </Stack>
      }
    />
  );
}

function QuoteRow({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" sx={{ justifyContent: 'space-between', gap: 2 }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2">{value}</Typography>
    </Stack>
  );
}
