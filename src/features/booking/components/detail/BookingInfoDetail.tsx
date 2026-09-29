import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { AppBadge } from '@/components/common';
import type { Booking } from '../../types/bookingRecord';
import {
  BOOKING_STATUS_LABELS,
  BOOKING_STATUS_TONE,
} from '../../utils/bookingStatus';
import {
  formatBookingTimestamp,
} from '../../utils/bookingDetailHelpers';
import { formatBookingMoney } from '../../utils/formatMoney';
import { BookingDetailSection } from './BookingDetailSection';

export interface BookingInfoDetailProps {
  booking: Booking;
}

export function BookingInfoDetail({ booking }: BookingInfoDetailProps) {
  return (
    <BookingDetailSection
      title="Booking information"
      subtitle="Reference, status, and booking timeline"
      action={
        <AppBadge
          label={BOOKING_STATUS_LABELS[booking.status]}
          tone={BOOKING_STATUS_TONE[booking.status]}
        />
      }
    >
      <Stack spacing={1.25}>
        <DetailRow label="Booking reference" value={booking.reference} emphasize />
        <DetailRow label="Status" value={BOOKING_STATUS_LABELS[booking.status]} />
        <DetailRow label="Transaction ID" value={booking.transactionId} />
        <DetailRow label="Booked on" value={formatBookingTimestamp(booking.createdAt)} />
        <DetailRow label="Last updated" value={formatBookingTimestamp(booking.updatedAt)} />
        <DetailRow
          label="Total paid"
          value={formatBookingMoney(
            booking.priceBreakdown.finalTotal,
            booking.priceBreakdown.currency,
          )}
          emphasize
        />
        <DetailRow
          label="Passengers"
          value={`${booking.passengers.length} traveler${booking.passengers.length === 1 ? '' : 's'}`}
        />
      </Stack>
    </BookingDetailSection>
  );
}

function DetailRow({
  label,
  value,
  emphasize = false,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={{ xs: 0.25, sm: 2 }}
      sx={{ justifyContent: 'space-between', alignItems: { sm: 'baseline' } }}
    >
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography
        variant={emphasize ? 'subtitle1' : 'body2'}
        sx={{
          fontWeight: emphasize ? 700 : 500,
          textAlign: { sm: 'right' },
          wordBreak: 'break-word',
        }}
      >
        {value}
      </Typography>
    </Stack>
  );
}
