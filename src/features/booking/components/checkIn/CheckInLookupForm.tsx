import Stack from '@mui/material/Stack';
import { useEffect, useState, type FormEvent } from 'react';
import { AppAlert, AppButton, AppCard, AppInput } from '@/components/common';
import { isValidBookingReference } from '../../utils/bookingDetailHelpers';

export interface CheckInLookupFormProps {
  initialReference?: string;
  initialLastName?: string;
  error?: string | null;
  loading?: boolean;
  onSubmit: (values: { reference: string; lastName: string }) => void;
}

export function CheckInLookupForm({
  initialReference = '',
  initialLastName = '',
  error = null,
  loading = false,
  onSubmit,
}: CheckInLookupFormProps) {
  const [reference, setReference] = useState(initialReference);
  const [lastName, setLastName] = useState(initialLastName);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (initialReference) {
      setReference(initialReference);
    }
  }, [initialReference]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmedRef = reference.trim();
    const trimmedName = lastName.trim();

    if (!trimmedRef || !isValidBookingReference(trimmedRef)) {
      setLocalError('Enter a valid booking reference (letters, numbers, and hyphens).');
      return;
    }
    if (!trimmedName) {
      setLocalError('Enter the passenger last name used on the booking.');
      return;
    }

    setLocalError(null);
    onSubmit({ reference: trimmedRef, lastName: trimmedName });
  };

  return (
    <AppCard
      title="Find your booking"
      subtitle="Enter your booking reference and the last name of any passenger on the booking."
    >
      <Stack component="form" spacing={2} onSubmit={handleSubmit} noValidate>
        {error || localError ? (
          <AppAlert severity="error">{error ?? localError}</AppAlert>
        ) : null}

        <AppInput
          label="Booking reference"
          value={reference}
          onChange={(event) => setReference(event.target.value.toUpperCase())}
          placeholder="AB-XXXXXXXX"
          autoComplete="off"
          required
          fullWidth
        />
        <AppInput
          label="Last name"
          value={lastName}
          onChange={(event) => setLastName(event.target.value)}
          placeholder="As shown on the booking"
          autoComplete="family-name"
          required
          fullWidth
        />

        <AppButton type="submit" variant="contained" disabled={loading}>
          Continue
        </AppButton>
      </Stack>
    </AppCard>
  );
}
