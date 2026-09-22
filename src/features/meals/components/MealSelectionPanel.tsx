import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { useEffect, useMemo, useState } from 'react';
import { AppAlert, AppButton } from '@/components/common';
import { useBookingStore } from '@/features/booking';
import type { MealPassenger, PassengerMealSelection } from '../types/meal';
import {
  calculateMealTotal,
  defaultMealSelection,
  removePassengerMeal,
  validateMealSelection,
} from '../utils/mealRules';
import { MealSelector } from './MealSelector';
import { MealSummary } from './MealSummary';

export interface MealSelectionPanelProps {
  flightId: string;
  passengers: MealPassenger[];
  onSaved?: () => void;
}

export function MealSelectionPanel({
  flightId,
  passengers,
  onSaved,
}: MealSelectionPanelProps) {
  const storedMeals = useBookingStore((state) => state.meals);
  const storedFlightId = useBookingStore((state) => state.flightId);
  const setMeals = useBookingStore((state) => state.setMeals);

  const initial = useMemo(() => {
    const stored = storedFlightId === flightId ? storedMeals : [];
    return passengers.map((passenger) => {
      const existing = stored.find((item) => item.passengerId === passenger.id);
      if (existing) {
        return existing;
      }
      return defaultMealSelection(passenger.id);
    });
  }, [flightId, passengers, storedFlightId, storedMeals]);

  const [selections, setSelections] = useState<PassengerMealSelection[]>(initial);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSelections(initial);
  }, [initial]);

  const syncBooking = (next: PassengerMealSelection[]) => {
    setMeals({
      flightId,
      meals: next,
      mealTotal: calculateMealTotal(next),
    });
  };

  const handleChange = (nextSelection: PassengerMealSelection) => {
    const next = selections.map((item) =>
      item.passengerId === nextSelection.passengerId ? nextSelection : item,
    );
    setSelections(next);
    setSaved(false);
    setError(null);
    syncBooking(next);
  };

  const handleRemove = (passengerId: string) => {
    const next = removePassengerMeal(selections, passengerId);
    setSelections(next);
    setSaved(false);
    setError(null);
    syncBooking(next);
  };

  return (
    <Stack spacing={2.5}>
      {saved ? (
        <AppAlert severity="success" title="Meals saved" onClose={() => setSaved(false)}>
          Meal choices were saved on this booking.
        </AppAlert>
      ) : null}
      {error ? (
        <AppAlert severity="error" title="Check meals" onClose={() => setError(null)}>
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
              defaultMealSelection(passenger.id);
            return (
              <MealSelector
                key={passenger.id}
                passenger={passenger}
                selection={selection}
                onChange={handleChange}
                onRemove={() => handleRemove(passenger.id)}
              />
            );
          })}
        </Stack>

        <Stack spacing={2}>
          <MealSummary passengers={passengers} selections={selections} />
          <AppButton
            variant="contained"
            fullWidth
            onClick={() => {
              const result = validateMealSelection({ selections, passengers });
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
            Save meals
          </AppButton>
        </Stack>
      </Box>
    </Stack>
  );
}
