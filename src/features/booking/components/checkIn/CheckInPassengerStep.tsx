import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { AppAlert, AppBadge, AppCard } from '@/components/common';
import type { Booking, BookingPassenger } from '../../types/bookingRecord';
import { formatPassengerLabel } from '../../utils/bookingDetailHelpers';
import {
  isPassengerCheckedIn,
  seatLabelForPassenger,
} from '../../utils/checkInRules';

export interface CheckInPassengerStepProps {
  booking: Booking;
  eligible: BookingPassenger[];
  selectedIds: string[];
  onChange: (passengerIds: string[]) => void;
}

export function CheckInPassengerStep({
  booking,
  eligible,
  selectedIds,
  onChange,
}: CheckInPassengerStepProps) {
  const toggle = (passengerId: string) => {
    if (selectedIds.includes(passengerId)) {
      onChange(selectedIds.filter((id) => id !== passengerId));
      return;
    }
    onChange([...selectedIds, passengerId]);
  };

  const alreadyCheckedIn = booking.passengers.filter((passenger) =>
    isPassengerCheckedIn(booking, passenger.id),
  );

  return (
    <AppCard
      title="Select passengers"
      subtitle="Choose who is checking in now. Already checked-in passengers cannot be selected."
    >
      <Stack spacing={2}>
        {alreadyCheckedIn.length > 0 ? (
          <AppAlert severity="info" title="Already checked in">
            {alreadyCheckedIn.map((passenger) => formatPassengerLabel(passenger)).join(', ')}
          </AppAlert>
        ) : null}

        {eligible.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No passengers are eligible for check-in.
          </Typography>
        ) : (
          <FormGroup>
            {eligible.map((passenger) => {
              const checked = selectedIds.includes(passenger.id);
              return (
                <FormControlLabel
                  key={passenger.id}
                  control={
                    <Checkbox
                      checked={checked}
                      onChange={() => toggle(passenger.id)}
                    />
                  }
                  label={
                    <Stack spacing={0.25} sx={{ py: 0.5 }}>
                      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                        <Typography variant="subtitle2">
                          {formatPassengerLabel(passenger)}
                        </Typography>
                        <AppBadge label={passenger.type} tone="default" size="small" />
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        Seat {seatLabelForPassenger(booking, passenger.id)}
                      </Typography>
                    </Stack>
                  }
                />
              );
            })}
          </FormGroup>
        )}
      </Stack>
    </AppCard>
  );
}
