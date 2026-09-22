import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { useEffect, useMemo, useState } from 'react';
import { AppAlert, AppButton } from '@/components/common';
import { useBookingStore } from '@/features/booking';
import type { AddonPassenger, AddonSelection } from '../types/addon';
import {
  calculateAddonTotal,
  calculateBookingTotal,
  removeAddon,
  validateAddonSelections,
} from '../utils/addonRules';
import { AddonSelector } from './AddonSelector';
import { AddonSummary } from './AddonSummary';

export interface AddonSelectionPanelProps {
  flightId: string;
  passengers: AddonPassenger[];
  onSaved?: () => void;
}

export function AddonSelectionPanel({
  flightId,
  passengers,
  onSaved,
}: AddonSelectionPanelProps) {
  const storedAddons = useBookingStore((state) => state.addons);
  const storedFlightId = useBookingStore((state) => state.flightId);
  const baggageTotal = useBookingStore((state) => state.baggageTotal);
  const mealTotal = useBookingStore((state) => state.mealTotal);
  const setAddons = useBookingStore((state) => state.setAddons);

  const initial = useMemo(() => {
    if (storedFlightId !== flightId) {
      return [] as AddonSelection[];
    }
    const passengerIds = new Set(passengers.map((passenger) => passenger.id));
    return storedAddons.filter((selection) => passengerIds.has(selection.passengerId));
  }, [flightId, passengers, storedAddons, storedFlightId]);

  const [selections, setSelections] = useState<AddonSelection[]>(initial);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSelections(initial);
  }, [initial]);

  const syncBooking = (next: AddonSelection[]) => {
    const addonTotal = calculateAddonTotal(next);
    setAddons({
      flightId,
      addons: next,
      addonTotal,
      bookingTotal: calculateBookingTotal({
        baggageTotal,
        mealTotal,
        addonTotal,
      }),
    });
  };

  const handleChange = (next: AddonSelection[]) => {
    setSelections(next);
    setSaved(false);
    setError(null);
    syncBooking(next);
  };

  return (
    <Stack spacing={2.5}>
      {saved ? (
        <AppAlert severity="success" title="Add-ons saved" onClose={() => setSaved(false)}>
          Add-on choices were saved and the booking total was updated.
        </AppAlert>
      ) : null}
      {error ? (
        <AppAlert severity="error" title="Check add-ons" onClose={() => setError(null)}>
          {error}
        </AppAlert>
      ) : null}

      <Box
        sx={{
          display: 'grid',
          gap: 2.5,
          gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) minmax(280px, 360px)' },
          alignItems: 'start',
        }}
      >
        <AddonSelector
          passengers={passengers}
          selections={selections}
          onChange={handleChange}
        />

        <Stack spacing={2}>
          <AddonSummary
            passengers={passengers}
            selections={selections}
            baggageTotal={baggageTotal}
            mealTotal={mealTotal}
            onRemove={(addonId, passengerId) =>
              handleChange(removeAddon(selections, addonId, passengerId))
            }
          />
          <AppButton
            variant="contained"
            fullWidth
            onClick={() => {
              const result = validateAddonSelections({ selections, passengers });
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
            Save add-ons
          </AppButton>
        </Stack>
      </Box>
    </Stack>
  );
}
