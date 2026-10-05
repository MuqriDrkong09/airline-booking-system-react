import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';
import { AppBadge, AppButton, AppDialog } from '@/components/common';
import {
  BOOKING_STATUS_LABELS,
  BOOKING_STATUS_TONE,
  formatBookingMoney,
} from '@/features/booking';
import type { AdminBooking } from '../types/adminBooking';

export interface BookingDetailsDialogProps {
  open: boolean;
  booking: AdminBooking | null;
  onClose: () => void;
  onModify?: (booking: AdminBooking) => void;
  onCancel?: (booking: AdminBooking) => void;
  onRefund?: (booking: AdminBooking) => void;
}

function DetailItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <Box sx={{ display: 'grid', gap: 0.5 }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" component="div" sx={{ wordBreak: 'break-word' }}>
        {value}
      </Typography>
    </Box>
  );
}

export function BookingDetailsDialog({
  open,
  booking,
  onClose,
  onModify,
  onCancel,
  onRefund,
}: BookingDetailsDialogProps) {
  const primary = booking?.passengers[0];

  return (
    <AppDialog
      open={open}
      title={booking ? `Booking ${booking.reference}` : 'Booking details'}
      onClose={onClose}
      maxWidth="md"
      actions={
        <>
          <AppButton onClick={onClose} color="inherit">
            Close
          </AppButton>
          {booking && onModify ? (
            <AppButton variant="outlined" onClick={() => onModify(booking)}>
              Modify
            </AppButton>
          ) : null}
          {booking && onCancel ? (
            <AppButton variant="outlined" color="error" onClick={() => onCancel(booking)}>
              Cancel
            </AppButton>
          ) : null}
          {booking && onRefund ? (
            <AppButton variant="contained" onClick={() => onRefund(booking)}>
              Refund
            </AppButton>
          ) : null}
        </>
      }
    >
      {booking ? (
        <Stack spacing={3}>
          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
            }}
          >
            <DetailItem label="Reference" value={booking.reference} />
            <DetailItem
              label="Status"
              value={
                <AppBadge
                  label={BOOKING_STATUS_LABELS[booking.status]}
                  tone={BOOKING_STATUS_TONE[booking.status]}
                />
              }
            />
            <DetailItem
              label="Flight"
              value={`${booking.flight.flightNumber} · ${booking.flight.airline.name}`}
            />
            <DetailItem
              label="Route"
              value={`${booking.flight.origin.code} → ${booking.flight.destination.code}`}
            />
            <DetailItem
              label="Departure"
              value={booking.flight.departureTime.replace('T', ' ')}
            />
            <DetailItem
              label="Arrival"
              value={booking.flight.arrivalTime.replace('T', ' ')}
            />
            <DetailItem
              label="Passenger"
              value={primary ? `${primary.firstName} ${primary.lastName}` : '—'}
            />
            <DetailItem label="Contact" value={primary?.email || '—'} />
            <DetailItem label="Phone" value={primary?.phone || '—'} />
            <DetailItem
              label="Total paid"
              value={formatBookingMoney(
                booking.priceBreakdown.finalTotal,
                booking.priceBreakdown.currency,
              )}
            />
            <DetailItem label="Passengers" value={booking.passengers.length} />
            <DetailItem label="Created" value={booking.createdAt.replace('T', ' ').slice(0, 16)} />
          </Box>

          {booking.cancellation ? (
            <Stack spacing={1}>
              <Typography variant="subtitle2">Cancellation / refund</Typography>
              <DetailItem
                label="Fee"
                value={formatBookingMoney(
                  booking.cancellation.fee,
                  booking.cancellation.currency,
                )}
              />
              <DetailItem
                label="Refund"
                value={formatBookingMoney(
                  booking.cancellation.refundAmount,
                  booking.cancellation.currency,
                )}
              />
              <DetailItem label="Policy" value={booking.cancellation.policySummary} />
            </Stack>
          ) : null}
        </Stack>
      ) : null}
    </AppDialog>
  );
}
