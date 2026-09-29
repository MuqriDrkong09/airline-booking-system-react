import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { MEAL_TYPE_LABELS } from '@/features/meals';
import type { Booking } from '../../types/bookingRecord';
import { formatPassengerLabel } from '../../utils/bookingDetailHelpers';
import { BookingDetailSection } from './BookingDetailSection';

export interface BookingMealsDetailProps {
  booking: Booking;
}

export function BookingMealsDetail({ booking }: BookingMealsDetailProps) {
  const mealByPassenger = new Map(booking.meals.map((item) => [item.passengerId, item]));

  return (
    <BookingDetailSection title="Meals" subtitle="Per-passenger meal choices">
      <Stack spacing={1.25}>
        {booking.passengers.map((passenger) => {
          const selection = mealByPassenger.get(passenger.id);
          const label =
            passenger.type === 'INFANT'
              ? 'No meal'
              : selection?.mealType
                ? `${MEAL_TYPE_LABELS[selection.mealType]} × ${selection.quantity}`
                : 'No meal selected';

          return (
            <Stack key={passenger.id} spacing={0.25}>
              <Typography variant="subtitle2">{formatPassengerLabel(passenger)}</Typography>
              <Typography variant="body2" color="text.secondary">
                {label}
              </Typography>
            </Stack>
          );
        })}
      </Stack>
    </BookingDetailSection>
  );
}
