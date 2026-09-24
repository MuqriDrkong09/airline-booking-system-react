import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { CircleCheck } from 'lucide-react';
import { AppBadge, AppCard } from '@/components/common';
import type { Booking, BookingRecordStatus } from '../../types/bookingRecord';

const STATUS_TONE: Record<
  BookingRecordStatus,
  'default' | 'info' | 'success' | 'warning' | 'error'
> = {
  PENDING: 'warning',
  CONFIRMED: 'success',
  CANCELLED: 'error',
  CHECKED_IN: 'info',
  COMPLETED: 'default',
  REFUNDED: 'warning',
};

const STATUS_LABELS: Record<BookingRecordStatus, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  CANCELLED: 'Cancelled',
  CHECKED_IN: 'Checked in',
  COMPLETED: 'Completed',
  REFUNDED: 'Refunded',
};

export interface BookingConfirmationSuccessProps {
  booking: Booking;
}

export function BookingConfirmationSuccess({ booking }: BookingConfirmationSuccessProps) {
  return (
    <AppCard>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ alignItems: { sm: 'center' } }}
      >
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            bgcolor: 'success.main',
            color: 'success.contrastText',
            flexShrink: 0,
          }}
          aria-hidden
        >
          <CircleCheck size={32} strokeWidth={2.25} />
        </Box>

        <Stack spacing={0.75} sx={{ minWidth: 0, flex: 1 }}>
          <Stack
            direction="row"
            spacing={1}
            sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}
          >
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Booking confirmed
            </Typography>
            <AppBadge
              label={STATUS_LABELS[booking.status]}
              tone={STATUS_TONE[booking.status]}
            />
          </Stack>
          <Typography variant="body1" color="text.secondary">
            Your payment was successful. Keep this reference for check-in and support.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Booking reference
          </Typography>
          <Typography
            variant="h4"
            sx={{ fontWeight: 800, letterSpacing: 0.5, wordBreak: 'break-all' }}
          >
            {booking.reference}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Transaction {booking.transactionId}
          </Typography>
        </Stack>
      </Stack>
    </AppCard>
  );
}
