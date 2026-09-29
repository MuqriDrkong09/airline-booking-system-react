import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { AppAlert, AppButton, AppInput } from '@/components/common';
import type { Booking, BookingPassenger } from '../../types/bookingRecord';
import { useBookingsStore } from '../../store/bookingsStore';
import { recomputeBookingPriceBreakdown } from '../../utils/recomputeBookingPriceBreakdown';
import { BookingDetailSection } from '../detail/BookingDetailSection';

export interface ManageContactFormProps {
  booking: Booking;
  onSaved?: () => void;
}

export function ManageContactForm({ booking, onSaved }: ManageContactFormProps) {
  const updateBooking = useBookingsStore((state) => state.updateBooking);
  const [passengers, setPassengers] = useState<BookingPassenger[]>(booking.passengers);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setPassengers(booking.passengers);
  }, [booking]);

  const handleChange = (passengerId: string, field: 'email' | 'phone', value: string) => {
    setPassengers((current) =>
      current.map((passenger) =>
        passenger.id === passengerId ? { ...passenger, [field]: value } : passenger,
      ),
    );
    setSaved(false);
    setError(null);
  };

  const handleSave = () => {
    for (const passenger of passengers) {
      if (passenger.type !== 'INFANT' && !passenger.email.trim()) {
        setError(`Add an email for ${passenger.firstName || passenger.id}.`);
        return;
      }
      if (passenger.type === 'ADULT' && !passenger.phone.trim()) {
        setError(`Add a phone number for ${passenger.firstName || passenger.id}.`);
        return;
      }
    }

    const updated = updateBooking(booking.reference, (current) => {
      const next = {
        ...current,
        passengers: passengers.map((passenger) => ({ ...passenger })),
        updatedAt: new Date().toISOString(),
      };
      return {
        ...next,
        priceBreakdown: recomputeBookingPriceBreakdown(next),
      };
    });

    if (!updated) {
      setError('Could not update contact details.');
      return;
    }

    setSaved(true);
    onSaved?.();
  };

  return (
    <BookingDetailSection
      title="Update contact details"
      subtitle="Email and phone used for booking updates"
    >
      <Stack spacing={2}>
        {saved ? (
          <AppAlert severity="success" onClose={() => setSaved(false)}>
            Contact details were updated.
          </AppAlert>
        ) : null}
        {error ? (
          <AppAlert severity="error" onClose={() => setError(null)}>
            {error}
          </AppAlert>
        ) : null}

        {passengers.map((passenger) => (
          <Stack key={passenger.id} spacing={1.25}>
            <Typography variant="subtitle2">
              {passenger.title} {passenger.firstName} {passenger.lastName}
            </Typography>
            <AppInput
              label="Email"
              type="email"
              value={passenger.email}
              onChange={(event) => handleChange(passenger.id, 'email', event.target.value)}
            />
            <AppInput
              label="Phone"
              value={passenger.phone}
              onChange={(event) => handleChange(passenger.id, 'phone', event.target.value)}
            />
          </Stack>
        ))}

        <AppButton variant="contained" onClick={handleSave} sx={{ alignSelf: 'flex-start' }}>
          Save contact details
        </AppButton>
      </Stack>
    </BookingDetailSection>
  );
}
