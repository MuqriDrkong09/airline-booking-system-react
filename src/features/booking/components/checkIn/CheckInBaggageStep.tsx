import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { AppCard } from '@/components/common';
import type { Booking, BookingPassenger } from '../../types/bookingRecord';
import { formatPassengerLabel } from '../../utils/bookingDetailHelpers';
import { baggageSummaryForPassenger } from '../../utils/checkInRules';

export interface CheckInBaggageStepProps {
  booking: Booking;
  passengers: BookingPassenger[];
}

export function CheckInBaggageStep({ booking, passengers }: CheckInBaggageStepProps) {
  return (
    <AppCard
      title="Confirm baggage"
      subtitle="Review cabin and checked baggage for the selected passengers."
    >
      <Stack spacing={1.25}>
        {passengers.map((passenger) => (
          <Stack key={passenger.id} spacing={0.25}>
            <Typography variant="subtitle2">{formatPassengerLabel(passenger)}</Typography>
            <Typography variant="body2" color="text.secondary">
              {baggageSummaryForPassenger(booking, passenger.id)}
            </Typography>
          </Stack>
        ))}
        <Typography variant="caption" color="text.secondary">
          Baggage changes can be made from Manage booking before check-in is completed.
        </Typography>
      </Stack>
    </AppCard>
  );
}
