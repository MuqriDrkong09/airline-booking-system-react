import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useEffect, useMemo, useState } from 'react';
import { AppAlert, AppButton, AppDialog } from '@/components/common';
import { todayIsoDate } from '@/features/flights/utils/dates';
import type { Booking } from '../../types/bookingRecord';
import { useBookingsStore } from '../../store/bookingsStore';
import { BOOKING_STATUS_LABELS } from '../../utils/bookingStatus';
import {
  calculateCancellationQuote,
  canCancelBooking,
  getCancellationBlockedReason,
  type CancellationQuote,
} from '../../utils/cancellationQuote';
import { formatBookingMoney } from '../../utils/formatMoney';

type CancellationStep = 'policy' | 'fees' | 'confirm' | 'result';

export interface BookingCancellationDialogProps {
  open: boolean;
  booking: Booking | null;
  onClose: () => void;
  onCompleted?: (booking: Booking) => void;
}

export function BookingCancellationDialog({
  open,
  booking,
  onClose,
  onCompleted,
}: BookingCancellationDialogProps) {
  const cancelBooking = useBookingsStore((state) => state.cancelBooking);
  const [step, setStep] = useState<CancellationStep>('policy');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultBooking, setResultBooking] = useState<Booking | null>(null);

  const todayIso = todayIsoDate();
  const quote = useMemo(
    () => (booking ? calculateCancellationQuote(booking) : null),
    [booking],
  );

  useEffect(() => {
    if (open) {
      setStep('policy');
      setLoading(false);
      setError(null);
      setResultBooking(null);
    }
  }, [open, booking?.reference]);

  if (!booking || !quote) {
    return null;
  }

  const blockedReason = getCancellationBlockedReason(booking, todayIso);
  const allowed = canCancelBooking(booking, todayIso);

  const handleConfirm = () => {
    if (!allowed) {
      setError(blockedReason ?? 'This booking cannot be cancelled.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const updated = cancelBooking(booking.reference);
      if (!updated) {
        setError(blockedReason ?? 'Cancellation could not be completed.');
        return;
      }
      setResultBooking(updated);
      setStep('result');
      onCompleted?.(updated);
    } finally {
      setLoading(false);
    }
  };

  const titleByStep: Record<CancellationStep, string> = {
    policy: 'Cancellation policy',
    fees: 'Cancellation fee & refund',
    confirm: 'Confirm cancellation',
    result: 'Cancellation result',
  };

  return (
    <AppDialog
      open={open}
      title={titleByStep[step]}
      onClose={loading ? () => undefined : onClose}
      maxWidth="sm"
      actions={
        step === 'result' ? (
          <AppButton variant="contained" onClick={onClose}>
            Done
          </AppButton>
        ) : (
          <>
            <AppButton onClick={onClose} disabled={loading} color="inherit">
              Keep booking
            </AppButton>
            {step === 'policy' ? (
              <AppButton
                variant="contained"
                color="error"
                disabled={!allowed}
                onClick={() => setStep('fees')}
              >
                Continue
              </AppButton>
            ) : null}
            {step === 'fees' ? (
              <>
                <AppButton onClick={() => setStep('policy')} disabled={loading} color="inherit">
                  Back
                </AppButton>
                <AppButton
                  variant="contained"
                  color="error"
                  disabled={!allowed}
                  onClick={() => setStep('confirm')}
                >
                  Continue
                </AppButton>
              </>
            ) : null}
            {step === 'confirm' ? (
              <>
                <AppButton onClick={() => setStep('fees')} disabled={loading} color="inherit">
                  Back
                </AppButton>
                <AppButton
                  variant="contained"
                  color="error"
                  loading={loading}
                  loadingLabel="Cancelling..."
                  disabled={!allowed}
                  onClick={handleConfirm}
                >
                  Confirm cancellation
                </AppButton>
              </>
            ) : null}
          </>
        )
      }
    >
      <Stack spacing={1.75}>
        {!allowed && blockedReason ? (
          <AppAlert severity="warning" title="Cancellation unavailable">
            {blockedReason}
          </AppAlert>
        ) : null}
        {error ? (
          <AppAlert severity="error" onClose={() => setError(null)}>
            {error}
          </AppAlert>
        ) : null}

        {step === 'policy' ? <PolicyStep booking={booking} quote={quote} /> : null}
        {step === 'fees' ? <FeesStep quote={quote} /> : null}
        {step === 'confirm' ? <ConfirmStep booking={booking} quote={quote} /> : null}
        {step === 'result' && resultBooking ? (
          <ResultStep booking={resultBooking} quote={quote} />
        ) : null}
      </Stack>
    </AppDialog>
  );
}

function PolicyStep({ booking, quote }: { booking: Booking; quote: CancellationQuote }) {
  return (
    <Stack spacing={1.25}>
      <Typography variant="body2" color="text.secondary">
        Booking {booking.reference} · {booking.flight.origin.code} →{' '}
        {booking.flight.destination.code}
      </Typography>
      <Typography variant="subtitle2">Refund policy</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
        {quote.policySummary}
      </Typography>
      {booking.flight.policies.fareConditions.length > 0 ? (
        <Stack component="ul" spacing={0.5} sx={{ m: 0, pl: 2.5 }}>
          {booking.flight.policies.fareConditions.map((condition) => (
            <Typography key={condition} component="li" variant="body2" color="text.secondary">
              {condition}
            </Typography>
          ))}
        </Stack>
      ) : null}
      <Typography variant="caption" color="text.secondary">
        Fare type: {quote.refundableFare ? 'Refundable' : 'Non-refundable'}
      </Typography>
    </Stack>
  );
}

function FeesStep({ quote }: { quote: CancellationQuote }) {
  return (
    <Stack spacing={1}>
      <MoneyRow
        label="Amount paid"
        value={formatBookingMoney(quote.paidTotal, quote.currency)}
      />
      <MoneyRow
        label="Cancellation fee"
        value={formatBookingMoney(quote.cancellationFee, quote.currency)}
      />
      <Divider />
      <MoneyRow
        label="Refund amount"
        value={formatBookingMoney(quote.refundAmount, quote.currency)}
        emphasize
      />
      <Typography variant="caption" color="text.secondary">
        {quote.refundAmount > 0
          ? 'After confirmation this booking will be marked refunded.'
          : 'After confirmation this booking will be marked cancelled with no refund.'}
      </Typography>
    </Stack>
  );
}

function ConfirmStep({ booking, quote }: { booking: Booking; quote: CancellationQuote }) {
  return (
    <Stack spacing={1.25}>
      <Typography variant="body2">
        Confirm cancellation of <strong>{booking.reference}</strong>? This cannot be undone.
      </Typography>
      <MoneyRow
        label="Cancellation fee"
        value={formatBookingMoney(quote.cancellationFee, quote.currency)}
      />
      <MoneyRow
        label="Refund amount"
        value={formatBookingMoney(quote.refundAmount, quote.currency)}
        emphasize
      />
    </Stack>
  );
}

function ResultStep({ booking, quote }: { booking: Booking; quote: CancellationQuote }) {
  const info = booking.cancellation;
  return (
    <Stack spacing={1.25}>
      <AppAlert
        severity={booking.status === 'REFUNDED' ? 'success' : 'info'}
        title={BOOKING_STATUS_LABELS[booking.status]}
      >
        Your cancellation request was processed.
      </AppAlert>
      <MoneyRow
        label="Cancellation fee"
        value={formatBookingMoney(info?.fee ?? quote.cancellationFee, quote.currency)}
      />
      <MoneyRow
        label="Refund amount"
        value={formatBookingMoney(
          info?.refundAmount ?? quote.refundAmount,
          quote.currency,
        )}
        emphasize
      />
      <Typography variant="body2" color="text.secondary">
        Updated status: {BOOKING_STATUS_LABELS[booking.status]}
      </Typography>
    </Stack>
  );
}

function MoneyRow({
  label,
  value,
  emphasize = false,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <Stack direction="row" sx={{ justifyContent: 'space-between', gap: 2 }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography
        variant={emphasize ? 'subtitle1' : 'body2'}
        sx={{ fontWeight: emphasize ? 700 : 500 }}
      >
        {value}
      </Typography>
    </Stack>
  );
}
