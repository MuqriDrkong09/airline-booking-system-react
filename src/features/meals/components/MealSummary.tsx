import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { AppCard } from '@/components/common';
import { formatMealPrice, MEAL_TYPE_LABELS } from '../constants/meals';
import type { MealPassenger, PassengerMealSelection } from '../types/meal';
import { calculateMealTotal, pricePassengerMeal } from '../utils/mealRules';

export interface MealSummaryProps {
  passengers: MealPassenger[];
  selections: PassengerMealSelection[];
}

export function MealSummary({ passengers, selections }: MealSummaryProps) {
  const total = calculateMealTotal(selections);
  const byId = new Map(selections.map((selection) => [selection.passengerId, selection]));

  return (
    <AppCard title="Meal summary" subtitle="Per-passenger meal assignments and fees.">
      <Stack spacing={1.5}>
        {passengers.map((passenger) => {
          const selection = byId.get(passenger.id);
          const line = selection ? pricePassengerMeal(selection) : 0;

          return (
            <Stack key={passenger.id} spacing={0.25}>
              <Typography variant="subtitle2">{passenger.displayName}</Typography>
              <Typography variant="body2" color="text.secondary">
                {passenger.type === 'INFANT'
                  ? 'No meal'
                  : selection?.mealType
                    ? `${MEAL_TYPE_LABELS[selection.mealType]} × ${selection.quantity} · ${
                        line === 0 ? 'Included' : formatMealPrice(line)
                      }`
                    : 'No meal selected'}
              </Typography>
            </Stack>
          );
        })}

        <Divider />
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Meal total
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {total === 0 ? '$0' : formatMealPrice(total)}
          </Typography>
        </Stack>
      </Stack>
    </AppCard>
  );
}
