import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { useEffect, useMemo, useState } from 'react';
import { AppAlert, AppButton } from '@/components/common';
import { useBookingStore } from '@/features/booking';
import type { CabinClass } from '@/features/flights';
import type { BaggagePassenger, PassengerBaggageSelection } from '../types/baggage';
import {
  calculateBaggageTotal,
  defaultSelection,
  getAllowanceForCabin,
  validateBaggageSelection,
} from '../utils/baggageRules';
import { BaggageSelector } from './BaggageSelector';
import { BaggageSummary } from './BaggageSummary';

export interface BaggageSelectionPanelProps {
  flightId: string;
  cabinClass: CabinClass;
  passengers: BaggagePassenger[];
  onSaved?: () => void;
}

export function BaggageSelectionPanel({
  flightId,
  cabinClass,
  passengers,
  onSaved,
}: BaggageSelectionPanelProps) {
  const allowance = getAllowanceForCabin(cabinClass);
  const storedBaggage = useBookingStore((state) => state.baggage);
  const storedFlightId = useBookingStore((state) => state.flightId);
  const setBaggage = useBookingStore((state) => state.setBaggage);

  const initial = useMemo(() => {
    const stored =
      storedFlightId === flightId
        ? storedBaggage
        : [];
    return passengers.map((passenger) => {
      const existing = stored.find((item) => item.passengerId === passenger.id);
      if (existing) {
        return existing;
      }
      const next = defaultSelection(passenger.id);
      if (passenger.type === 'INFANT') {
        return { ...next, cabinKg: 7 as const, checkedKg: 0 as const, additionalKg: 0 as const };
      }
      return next;
    });
  }, [flightId, passengers, storedBaggage, storedFlightId]);

  const [selections, setSelections] = useState<PassengerBaggageSelection[]>(initial);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSelections(initial);
  }, [initial]);

  const syncBooking = (next: PassengerBaggageSelection[]) => {
    const total = calculateBaggageTotal(next, passengers, allowance);
    setBaggage({
      flightId,
      cabinClass,
      baggage: next,
      baggageTotal: total,
    });
  };

  const handleChange = (nextSelection: PassengerBaggageSelection) => {
    const next = selections.map((item) =>
      item.passengerId === nextSelection.passengerId ? nextSelection : item,
    );
    setSelections(next);
    setSaved(false);
    setError(null);
    syncBooking(next);
  };

  return (
    <Stack spacing={2.5}>
      {saved ? (
        <AppAlert severity="success" title="Baggage saved" onClose={() => setSaved(false)}>
          Baggage choices were saved on this booking.
        </AppAlert>
      ) : null}
      {error ? (
        <AppAlert severity="error" title="Check baggage" onClose={() => setError(null)}>
          {error}
        </AppAlert>
      ) : null}

      <Box
        sx={{
          display: 'grid',
          gap: 2.5,
          gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) minmax(280px, 340px)' },
          alignItems: 'start',
        }}
      >
        <Stack spacing={2}>
          {passengers.map((passenger) => {
            const selection =
              selections.find((item) => item.passengerId === passenger.id) ??
              defaultSelection(passenger.id);
            return (
              <BaggageSelector
                key={passenger.id}
                passenger={passenger}
                allowance={allowance}
                selection={selection}
                onChange={handleChange}
              />
            );
          })}
        </Stack>

        <Stack spacing={2}>
          <BaggageSummary
            allowance={allowance}
            passengers={passengers}
            selections={selections}
          />
          <AppButton
            variant="contained"
            fullWidth
            onClick={() => {
              const result = validateBaggageSelection({ selections, passengers });
              if (!result.ok) {
                setError(result.message);
                setSaved(false);
                return;
              }
              syncBooking(selections);
              setError(null);
              setSaved(true);
              onSaved?.();
            }}
          >
            Save baggage
          </AppButton>
        </Stack>
      </Box>
    </Stack>
  );
}
