import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { formatMealPrice, MEAL_TYPE_LABELS } from '@/features/meals';
import type { PassengerMealSelection } from '@/features/meals';
import { PASSENGER_TYPE_LABELS, type PassengerDraft } from '@/features/passengers';
import { passengerDisplayName } from '@/features/seats';
import { formatBookingMoney } from '../utils/formatMoney';
import { SummarySection } from './SummarySection';

export interface MealSummaryProps {
  meals: PassengerMealSelection[];
  passengers: PassengerDraft[];
  mealTotal: number;
  currency?: string;
  editTo?: string;
}

export function MealSummary({
  meals,
  passengers,
  mealTotal,
  currency = 'USD',
  editTo,
}: MealSummaryProps) {
  const nameById = new Map(
    passengers.map((passenger, index) => [
      passenger.id,
      passengerDisplayName(
        passenger.firstName,
        passenger.lastName,
        `${PASSENGER_TYPE_LABELS[passenger.type]} ${index + 1}`,
      ),
    ]),
  );
  const byId = new Map(meals.map((selection) => [selection.passengerId, selection]));

  return (
    <SummarySection
      title="Meals"
      editTo={editTo}
      empty={passengers.length === 0}
      emptyMessage="No meal selections yet."
    >
      <Stack spacing={1.25}>
        {passengers.map((passenger) => {
          const selection = byId.get(passenger.id);
          const label =
            passenger.type === 'INFANT'
              ? 'No meal'
              : selection?.mealType
                ? `${MEAL_TYPE_LABELS[selection.mealType]} × ${selection.quantity}`
                : 'No meal selected';

          return (
            <Stack key={passenger.id} spacing={0.25}>
              <Typography variant="subtitle2">
                {nameById.get(passenger.id) ?? passenger.id}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {label}
              </Typography>
            </Stack>
          );
        })}
        <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
          <Typography variant="body2" color="text.secondary">
            Meal total
          </Typography>
          <Typography variant="subtitle2">
            {mealTotal === 0 ? formatMealPrice(0) : formatBookingMoney(mealTotal, currency)}
          </Typography>
        </Stack>
      </Stack>
    </SummarySection>
  );
}
