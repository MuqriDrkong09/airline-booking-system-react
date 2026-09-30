import Stack from '@mui/material/Stack';
import { useState, type FormEvent } from 'react';
import { AppAlert, AppButton, AppCard, AppDatePicker, AppInput } from '@/components/common';
import { isValidFlightNumber, normalizeFlightNumber } from '../../api/flightStatusData';
import { isValidCalendarDate, todayIsoDate } from '../../utils/dates';

export interface FlightStatusLookupFormProps {
  initialFlightNumber?: string;
  initialDate?: string;
  loading?: boolean;
  onSubmit: (values: { flightNumber: string; date: string }) => void;
}

export function FlightStatusLookupForm({
  initialFlightNumber = '',
  initialDate = todayIsoDate(),
  loading = false,
  onSubmit,
}: FlightStatusLookupFormProps) {
  const [flightNumber, setFlightNumber] = useState(initialFlightNumber);
  const [date, setDate] = useState(initialDate);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const normalizedNumber = normalizeFlightNumber(flightNumber);
    const trimmedDate = date.trim();

    if (!isValidFlightNumber(normalizedNumber)) {
      setError('Enter a valid flight number (for example MH123 or SQ169).');
      return;
    }
    if (!isValidCalendarDate(trimmedDate)) {
      setError('Enter a valid departure date.');
      return;
    }

    setError(null);
    onSubmit({ flightNumber: normalizedNumber, date: trimmedDate });
  };

  return (
    <AppCard
      title="Find a flight"
      subtitle="Search by flight number and departure date to see live operational status."
    >
      <Stack component="form" spacing={2} onSubmit={handleSubmit} noValidate>
        {error ? <AppAlert severity="error">{error}</AppAlert> : null}

        <AppInput
          label="Flight number"
          value={flightNumber}
          onChange={(event) => setFlightNumber(event.target.value.toUpperCase())}
          placeholder="e.g. MH123"
          autoComplete="off"
          required
          fullWidth
        />
        <AppDatePicker
          label="Departure date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          required
          fullWidth
        />

        <AppButton type="submit" variant="contained" disabled={loading}>
          {loading ? 'Looking up…' : 'Check status'}
        </AppButton>
      </Stack>
    </AppCard>
  );
}
