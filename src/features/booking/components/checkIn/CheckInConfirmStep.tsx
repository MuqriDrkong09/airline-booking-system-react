import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { AppCard } from '@/components/common';
import type { Booking, BookingPassenger } from '../../types/bookingRecord';
import { formatPassengerLabel } from '../../utils/bookingDetailHelpers';
import {
  baggageSummaryForPassenger,
  seatLabelForPassenger,
} from '../../utils/checkInRules';

export interface CheckInConfirmStepProps {
  booking: Booking;
  passengers: BookingPassenger[];
}

export function CheckInConfirmStep({ booking, passengers }: CheckInConfirmStepProps) {
  const { flight } = booking;

  return (
    <AppCard
      title="Confirm check-in"
      subtitle="Review flight and passenger details before completing check-in."
    >
      <Stack spacing={2}>
        <Stack spacing={0.5}>
          <Typography variant="overline" color="text.secondary">
            Flight
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {flight.airline.name} {flight.flightNumber}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {flight.origin.code} → {flight.destination.code} · Departs{' '}
            {flight.departureTime.replace('T', ' ')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Booking {booking.reference}
          </Typography>
        </Stack>

        <Stack spacing={1.25}>
          <Typography variant="overline" color="text.secondary">
            Passengers checking in
          </Typography>
          {passengers.map((passenger) => (
            <Stack key={passenger.id} spacing={0.25}>
              <Typography variant="subtitle2">{formatPassengerLabel(passenger)}</Typography>
              <Typography variant="body2" color="text.secondary">
                Seat {seatLabelForPassenger(booking, passenger.id)} ·{' '}
                {baggageSummaryForPassenger(booking, passenger.id)}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Stack>
    </AppCard>
  );
}
