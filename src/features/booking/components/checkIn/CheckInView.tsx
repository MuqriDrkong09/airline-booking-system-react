import Box from '@mui/material/Box';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AppAlert, AppButton, AppCard } from '@/components/common';
import type { Booking, BookingPassenger } from '../../types/bookingRecord';
import { useBookingsStore } from '../../store/bookingsStore';
import {
  CHECK_IN_BLOCKED_MESSAGES,
  findBookingForCheckIn,
  getEligibleCheckInPassengers,
  type CheckInBlockedReason,
} from '../../utils/checkInRules';
import { CheckInBaggageStep } from './CheckInBaggageStep';
import { CheckInConfirmStep } from './CheckInConfirmStep';
import { CheckInLookupForm } from './CheckInLookupForm';
import { CheckInPassengerStep } from './CheckInPassengerStep';
import { CheckInResultStep } from './CheckInResultStep';
import { CheckInSeatsStep } from './CheckInSeatsStep';

export type CheckInStep =
  | 'lookup'
  | 'passengers'
  | 'seats'
  | 'baggage'
  | 'confirm'
  | 'result';

const STEP_ORDER: CheckInStep[] = [
  'lookup',
  'passengers',
  'seats',
  'baggage',
  'confirm',
  'result',
];

const STEP_LABELS: Record<CheckInStep, string> = {
  lookup: 'Find booking',
  passengers: 'Passengers',
  seats: 'Seats',
  baggage: 'Baggage',
  confirm: 'Confirm',
  result: 'Done',
};

export function CheckInView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const bookings = useBookingsStore((state) => state.bookings);
  const checkInBooking = useBookingsStore((state) => state.checkInBooking);

  const [step, setStep] = useState<CheckInStep>('lookup');
  const [booking, setBooking] = useState<Booking | null>(null);
  const [lastName, setLastName] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkedInPassengers, setCheckedInPassengers] = useState<BookingPassenger[]>(
    [],
  );

  const prefillReference = searchParams.get('reference')?.trim() ?? '';

  const eligible = useMemo(
    () => (booking ? getEligibleCheckInPassengers(booking) : []),
    [booking],
  );

  const selectedPassengers = useMemo(
    () =>
      booking
        ? booking.passengers.filter((passenger) => selectedIds.includes(passenger.id))
        : [],
    [booking, selectedIds],
  );

  const activeStepIndex = STEP_ORDER.indexOf(step);

  const resetFlow = () => {
    setStep('lookup');
    setBooking(null);
    setLastName('');
    setSelectedIds([]);
    setLookupError(null);
    setActionError(null);
    setCheckedInPassengers([]);
    if (searchParams.has('reference')) {
      const next = new URLSearchParams(searchParams);
      next.delete('reference');
      setSearchParams(next, { replace: true });
    }
  };

  const handleLookup = (values: { reference: string; lastName: string }) => {
    setLookupError(null);
    const result = findBookingForCheckIn(bookings, values.reference, values.lastName);

    if (!result.booking || result.reason) {
      const reason = (result.reason ?? 'NOT_FOUND') as CheckInBlockedReason;
      setLookupError(CHECK_IN_BLOCKED_MESSAGES[reason]);
      setBooking(null);
      return;
    }

    setBooking(result.booking);
    setLastName(values.lastName.trim());
    setSelectedIds(getEligibleCheckInPassengers(result.booking).map((item) => item.id));
    setStep('passengers');
  };

  const handleCompleteCheckIn = () => {
    if (!booking || selectedIds.length === 0) {
      setActionError('Select at least one passenger to check in.');
      return;
    }

    setLoading(true);
    setActionError(null);
    try {
      const updated = checkInBooking(booking.reference, selectedIds);
      if (!updated) {
        setActionError(
          'Check-in could not be completed. The window may have closed or passengers are already checked in.',
        );
        return;
      }
      setCheckedInPassengers(
        updated.passengers.filter((passenger) => selectedIds.includes(passenger.id)),
      );
      setBooking(updated);
      setStep('result');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack spacing={2.5} sx={{ width: '100%', maxWidth: 720 }}>
      <AppCard title="Online check-in" subtitle="Complete check-in before your flight.">
        <Stepper
          activeStep={Math.min(activeStepIndex, STEP_ORDER.length - 1)}
          alternativeLabel
          sx={{ mb: 1 }}
        >
          {STEP_ORDER.filter((item) => item !== 'result').map((item) => (
            <Step key={item} completed={activeStepIndex > STEP_ORDER.indexOf(item)}>
              <StepLabel>{STEP_LABELS[item]}</StepLabel>
            </Step>
          ))}
        </Stepper>
        {booking && step !== 'lookup' && step !== 'result' ? (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Booking {booking.reference}
            {lastName ? ` · ${lastName}` : ''}
          </Typography>
        ) : null}
      </AppCard>

      {step === 'lookup' ? (
        <CheckInLookupForm
          initialReference={prefillReference}
          initialLastName={lastName}
          error={lookupError}
          onSubmit={handleLookup}
        />
      ) : null}

      {step === 'passengers' && booking ? (
        <CheckInPassengerStep
          booking={booking}
          eligible={eligible}
          selectedIds={selectedIds}
          onChange={setSelectedIds}
        />
      ) : null}

      {step === 'seats' && booking ? (
        <CheckInSeatsStep booking={booking} passengers={selectedPassengers} />
      ) : null}

      {step === 'baggage' && booking ? (
        <CheckInBaggageStep booking={booking} passengers={selectedPassengers} />
      ) : null}

      {step === 'confirm' && booking ? (
        <Stack spacing={2}>
          {actionError ? <AppAlert severity="error">{actionError}</AppAlert> : null}
          <CheckInConfirmStep booking={booking} passengers={selectedPassengers} />
        </Stack>
      ) : null}

      {step === 'result' && booking ? (
        <CheckInResultStep
          booking={booking}
          checkedInPassengers={checkedInPassengers}
          onStartOver={resetFlow}
        />
      ) : null}

      {step !== 'lookup' && step !== 'result' ? (
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1.25,
            justifyContent: 'flex-end',
          }}
        >
          <AppButton
            variant="outlined"
            color="inherit"
            disabled={loading}
            onClick={() => {
              if (step === 'passengers') {
                resetFlow();
                return;
              }
              const index = STEP_ORDER.indexOf(step);
              setStep(STEP_ORDER[Math.max(0, index - 1)] ?? 'lookup');
            }}
          >
            Back
          </AppButton>

          {step === 'passengers' ? (
            <AppButton
              variant="contained"
              disabled={selectedIds.length === 0}
              onClick={() => setStep('seats')}
            >
              Continue to seats
            </AppButton>
          ) : null}

          {step === 'seats' ? (
            <AppButton variant="contained" onClick={() => setStep('baggage')}>
              Continue to baggage
            </AppButton>
          ) : null}

          {step === 'baggage' ? (
            <AppButton variant="contained" onClick={() => setStep('confirm')}>
              Continue to confirm
            </AppButton>
          ) : null}

          {step === 'confirm' ? (
            <AppButton
              variant="contained"
              disabled={loading || selectedIds.length === 0}
              onClick={handleCompleteCheckIn}
            >
              {loading ? 'Checking in…' : 'Complete check-in'}
            </AppButton>
          ) : null}
        </Box>
      ) : null}
    </Stack>
  );
}
