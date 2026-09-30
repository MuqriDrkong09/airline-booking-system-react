import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { AppCard } from '@/components/common';
import type { Booking, BookingPassenger } from '../../types/bookingRecord';
import { formatPassengerLabel } from '../../utils/bookingDetailHelpers';
import { seatLabelForPassenger } from '../../utils/checkInRules';

export interface CheckInSeatsStepProps {
  booking: Booking;
  passengers: BookingPassenger[];
}

export function CheckInSeatsStep({ booking, passengers }: CheckInSeatsStepProps) {
  return (
    <AppCard
      title="Confirm seats"
      subtitle="Review assigned seats for the passengers you are checking in."
    >
      <Stack spacing={1.25}>
        {passengers.map((passenger) => (
          <Stack
            key={passenger.id}
            direction="row"
            sx={{ justifyContent: 'space-between', gap: 1 }}
          >
            <Typography variant="body2">{formatPassengerLabel(passenger)}</Typography>
            <Typography variant="subtitle2">
              {seatLabelForPassenger(booking, passenger.id)}
            </Typography>
          </Stack>
        ))}
        <Typography variant="caption" color="text.secondary">
          Seat changes can be made from Manage booking before the check-in window closes.
        </Typography>
      </Stack>
    </AppCard>
  );
}
