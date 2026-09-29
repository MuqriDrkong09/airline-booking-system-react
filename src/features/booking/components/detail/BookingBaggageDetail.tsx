import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { formatBaggageWeight } from '@/features/baggage';
import type { Booking } from '../../types/bookingRecord';
import { passengerNameById } from '../../utils/bookingDetailHelpers';
import { BookingDetailSection } from './BookingDetailSection';

export interface BookingBaggageDetailProps {
  booking: Booking;
}

export function BookingBaggageDetail({ booking }: BookingBaggageDetailProps) {
  const names = passengerNameById(booking);

  return (
    <BookingDetailSection
      title="Baggage"
      subtitle="Cabin, checked, and extra bags"
      empty={booking.baggage.length === 0}
      emptyMessage="No baggage selections recorded."
    >
      <Stack spacing={1.25}>
        {booking.baggage.map((selection) => (
          <Stack key={selection.passengerId} spacing={0.25}>
            <Typography variant="subtitle2">
              {names.get(selection.passengerId) ?? selection.passengerId}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Cabin {formatBaggageWeight(selection.cabinKg)}
              {selection.checkedKg > 0
                ? ` · Checked ${formatBaggageWeight(selection.checkedKg)}`
                : ' · No checked bag'}
              {selection.additionalKg > 0
                ? ` · Extra ${formatBaggageWeight(selection.additionalKg)}`
                : ''}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </BookingDetailSection>
  );
}
