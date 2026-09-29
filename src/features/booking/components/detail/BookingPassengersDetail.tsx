import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { AppBadge } from '@/components/common';
import { PASSENGER_TYPE_LABELS } from '@/features/passengers';
import type { Booking } from '../../types/bookingRecord';
import { formatPassengerLabel } from '../../utils/bookingDetailHelpers';
import { BookingDetailSection } from './BookingDetailSection';

export interface BookingPassengersDetailProps {
  booking: Booking;
}

export function BookingPassengersDetail({ booking }: BookingPassengersDetailProps) {
  return (
    <BookingDetailSection
      title="Passengers"
      subtitle={`${booking.passengers.length} traveler${booking.passengers.length === 1 ? '' : 's'}`}
      empty={booking.passengers.length === 0}
      emptyMessage="No passengers on this booking."
    >
      <Stack spacing={1.5}>
        {booking.passengers.map((passenger) => (
          <Stack key={passenger.id} spacing={0.25}>
            <Stack direction="row" spacing={1} useFlexGap sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
              <Typography variant="subtitle2">{formatPassengerLabel(passenger)}</Typography>
              <AppBadge
                label={PASSENGER_TYPE_LABELS[passenger.type]}
                size="small"
                tone="default"
              />
            </Stack>
            <Typography variant="body2" color="text.secondary">
              {[
                passenger.dateOfBirth ? `DOB ${passenger.dateOfBirth}` : null,
                passenger.nationality || null,
                passenger.passportNumber ? `Passport ${passenger.passportNumber}` : null,
                passenger.email || null,
                passenger.phone || null,
              ]
                .filter(Boolean)
                .join(' · ')}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </BookingDetailSection>
  );
}
