import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { AppBadge, AppButton, AppCard } from '@/components/common';
import type { Seat, SeatAssignment, SeatPassenger } from '../types/seat';
import { formatSeatPrice } from '../utils/seatMap';
import {
  calculateSeatPriceTotal,
  getAssignmentForPassenger,
  getSeatById,
  passengersNeedingSeats,
} from '../utils/seatRules';

export interface SeatSelectionSummaryProps {
  passengers: SeatPassenger[];
  seats: Seat[];
  assignments: SeatAssignment[];
  selectedPassengerId: string | null;
  onSelectPassenger: (passengerId: string) => void;
  onClearSeat: (passengerId: string) => void;
}

export function SeatSelectionSummary({
  passengers,
  seats,
  assignments,
  selectedPassengerId,
  onSelectPassenger,
  onClearSeat,
}: SeatSelectionSummaryProps) {
  const eligible = passengersNeedingSeats(passengers);
  const total = calculateSeatPriceTotal(seats, assignments);
  const infants = passengers.filter((passenger) => passenger.type === 'INFANT');

  return (
    <AppCard
      title="Seat selection"
      subtitle="Choose a passenger, then pick an available seat on the map."
    >
      <Stack spacing={1.5}>
        {eligible.map((passenger) => {
          const assignment = getAssignmentForPassenger(assignments, passenger.id);
          const seat = assignment ? getSeatById(seats, assignment.seatId) : undefined;
          const isActive = passenger.id === selectedPassengerId;

          return (
            <Stack
              key={passenger.id}
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              sx={{
                alignItems: { sm: 'center' },
                justifyContent: 'space-between',
                p: 1.25,
                borderRadius: 1.5,
                border: '1px solid',
                borderColor: isActive ? 'primary.main' : 'divider',
                bgcolor: isActive ? 'action.selected' : 'transparent',
              }}
            >
              <Stack spacing={0.25} sx={{ minWidth: 0 }}>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}
                >
                  <Typography variant="subtitle2" noWrap>
                    {passenger.displayName}
                  </Typography>
                  <AppBadge
                    label={passenger.type === 'ADULT' ? 'Adult' : 'Child'}
                    size="small"
                    tone="default"
                  />
                  {isActive ? <AppBadge label="Selecting" size="small" tone="primary" /> : null}
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  {seat
                    ? `${seat.label} · ${formatSeatPrice(seat.price)}`
                    : 'No seat assigned'}
                </Typography>
              </Stack>

              <Stack direction="row" spacing={1}>
                <AppButton
                  size="small"
                  variant={isActive ? 'contained' : 'outlined'}
                  onClick={() => onSelectPassenger(passenger.id)}
                  aria-pressed={isActive}
                >
                  {isActive ? 'Selected' : 'Select'}
                </AppButton>
                {seat ? (
                  <AppButton
                    size="small"
                    variant="text"
                    onClick={() => onClearSeat(passenger.id)}
                  >
                    Clear
                  </AppButton>
                ) : null}
              </Stack>
            </Stack>
          );
        })}

        {infants.length > 0 ? (
          <Typography variant="caption" color="text.secondary">
            Infants travel on an adult’s lap and are not assigned seats (
            {infants.map((infant) => infant.displayName).join(', ')}).
          </Typography>
        ) : null}

        <Divider />

        <Stack
          direction="row"
          sx={{ justifyContent: 'space-between', alignItems: 'center' }}
        >
          <Typography variant="body2" color="text.secondary">
            {assignments.length} of {eligible.length} seats assigned
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Seat fees {formatSeatPrice(total)}
          </Typography>
        </Stack>
      </Stack>
    </AppCard>
  );
}
