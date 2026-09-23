import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { PassengerDraft } from '@/features/passengers';
import { PASSENGER_TYPE_LABELS } from '@/features/passengers';
import { passengerDisplayName } from '@/features/seats';
import type { BookingSeatSelection } from '../types/booking';
import { formatBookingMoney } from '../utils/formatMoney';
import { SummarySection } from './SummarySection';

export interface SeatSummaryProps {
  seats: BookingSeatSelection[];
  passengers: PassengerDraft[];
  currency?: string;
  editTo?: string;
}

export function SeatSummary({
  seats,
  passengers,
  currency = 'USD',
  editTo,
}: SeatSummaryProps) {
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
  const total = seats.reduce((sum, seat) => sum + seat.price, 0);

  return (
    <SummarySection
      title="Seats"
      subtitle={seats.length > 0 ? `${seats.length} assigned` : undefined}
      editTo={editTo}
      empty={seats.length === 0}
      emptyMessage="No seats assigned yet."
    >
      <Stack spacing={1.25}>
        {seats.map((seat) => (
          <Stack
            key={`${seat.passengerId}-${seat.seatId}`}
            direction="row"
            sx={{ justifyContent: 'space-between', gap: 1 }}
          >
            <Stack spacing={0.25} sx={{ minWidth: 0 }}>
              <Typography variant="subtitle2" noWrap>
                {seat.label}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {nameById.get(seat.passengerId) ?? seat.passengerId}
              </Typography>
            </Stack>
            <Typography variant="body2">
              {formatBookingMoney(seat.price, currency)}
            </Typography>
          </Stack>
        ))}
        <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
          <Typography variant="body2" color="text.secondary">
            Seat fees
          </Typography>
          <Typography variant="subtitle2">{formatBookingMoney(total, currency)}</Typography>
        </Stack>
      </Stack>
    </SummarySection>
  );
}
