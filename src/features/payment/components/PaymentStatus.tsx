import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { AppAlert, AppButton, AppCard } from '@/components/common';
import type { PaymentUiStatus } from '../types/payment';

export interface PaymentStatusProps {
  status: PaymentUiStatus;
  message?: string | null;
  transactionId?: string | null;
  bookingReference?: string | null;
  onRetry?: () => void;
}

export function PaymentStatus({
  status,
  message,
  transactionId,
  bookingReference,
  onRetry,
}: PaymentStatusProps) {
  if (status === 'IDLE') {
    return null;
  }

  if (status === 'PROCESSING') {
    return (
      <AppAlert severity="info" title="Processing payment">
        Please wait — do not refresh or submit again while we confirm your payment.
      </AppAlert>
    );
  }

  if (status === 'SUCCESS') {
    return (
      <AppCard title="Payment successful" subtitle="Your booking is confirmed.">
        <Stack spacing={1.25}>
          <Typography variant="body2">{message ?? 'Payment completed successfully.'}</Typography>
          {bookingReference ? (
            <Typography variant="body2" color="text.secondary">
              Booking reference: <strong>{bookingReference}</strong>
            </Typography>
          ) : null}
          {transactionId ? (
            <Typography variant="caption" color="text.secondary">
              Transaction ID: {transactionId}
            </Typography>
          ) : null}
        </Stack>
      </AppCard>
    );
  }

  return (
    <AppCard title="Payment failed" subtitle="No charge was completed for this attempt.">
      <Stack spacing={1.5}>
        <AppAlert severity="error" title="Unable to complete payment">
          {message ?? 'Something went wrong while processing your payment.'}
        </AppAlert>
        {onRetry ? (
          <AppButton variant="contained" onClick={onRetry}>
            Retry payment
          </AppButton>
        ) : null}
      </Stack>
    </AppCard>
  );
}
