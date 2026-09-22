import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { AppButton, AppCard, AppSelect } from '@/components/common';
import { formatMealPrice } from '../constants/meals';
import type { MealPassenger, PassengerMealSelection } from '../types/meal';
import {
  getMealCatalogItem,
  isMealSelectable,
  mealsForPassenger,
  pricePassengerMeal,
} from '../utils/mealRules';
import { MealOption } from './MealOption';

export interface MealSelectorProps {
  passenger: MealPassenger;
  selection: PassengerMealSelection;
  onChange: (selection: PassengerMealSelection) => void;
  onRemove: () => void;
}

export function MealSelector({
  passenger,
  selection,
  onChange,
  onRemove,
}: MealSelectorProps) {
  const options = mealsForPassenger(passenger);
  const selectedMeal = selection.mealType
    ? getMealCatalogItem(selection.mealType)
    : undefined;
  const lineTotal = pricePassengerMeal(selection);

  if (passenger.type === 'INFANT') {
    return (
      <AppCard title={passenger.displayName} subtitle="Infants are not assigned in-flight meals.">
        <Typography variant="body2" color="text.secondary">
          No meal selection required.
        </Typography>
      </AppCard>
    );
  }

  return (
    <AppCard
      title={passenger.displayName}
      subtitle="Choose a meal, set quantity, or remove the selection."
      footer={
        selection.mealType ? (
          <Stack
            direction="row"
            spacing={1}
            sx={{ width: '100%', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <Typography variant="body2" color="text.secondary">
              Line total {lineTotal === 0 ? 'Included' : formatMealPrice(lineTotal)}
            </Typography>
            <AppButton size="small" variant="text" color="error" onClick={onRemove}>
              Remove meal
            </AppButton>
          </Stack>
        ) : undefined
      }
    >
      <Stack spacing={2}>
        <Stack spacing={1} role="radiogroup" aria-label={`${passenger.displayName} meals`}>
          {options.map((meal) => (
            <MealOption
              key={meal.type}
              meal={meal}
              selected={selection.mealType === meal.type}
              disabled={!isMealSelectable(meal, passenger)}
              onSelect={() =>
                onChange({
                  passengerId: passenger.id,
                  mealType: meal.type,
                  quantity: selection.mealType === meal.type ? selection.quantity || 1 : 1,
                })
              }
            />
          ))}
        </Stack>

        {selectedMeal ? (
          <AppSelect
            id={`meal-qty-${passenger.id}`}
            label="Quantity"
            value={selection.quantity || 1}
            options={Array.from(
              { length: selectedMeal.maxQuantityPerPassenger },
              (_, index) => {
                const qty = index + 1;
                return { value: qty, label: String(qty) };
              },
            )}
            onChange={(value) =>
              onChange({
                passengerId: passenger.id,
                mealType: selection.mealType,
                quantity: Number(value),
              })
            }
          />
        ) : (
          <Typography variant="body2" color="text.secondary">
            No meal selected yet.
          </Typography>
        )}
      </Stack>
    </AppCard>
  );
}
