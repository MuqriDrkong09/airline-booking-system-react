import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { Booking } from '../../types/bookingRecord';
import { formatPassengerLabel } from '../../utils/bookingDetailHelpers';
import { formatBookingMoney } from '../../utils/formatMoney';
import { BookingDetailSection } from './BookingDetailSection';

export interface BookingSeatsDetailProps {
  booking: Booking;
}

export function BookingSeatsDetail({ booking }: BookingSeatsDetailProps) {
  const seatByPassenger = new Map(booking.seats.map((seat) => [seat.passengerId, seat]));
  const seatEligible = booking.passengers.filter((passenger) => passenger.type !== 'INFANT');
  const hasInfants = booking.passengers.some((passenger) => passenger.type === 'INFANT');

  return (
    <BookingDetailSection
      title="Seats"
      subtitle="Assigned seat numbers"
      empty={seatEligible.length === 0}
      emptyMessage="No seat-eligible passengers."
    >
      <Stack spacing={1}>
        {seatEligible.map((passenger) => {
          const seat = seatByPassenger.get(passenger.id);
          return (
            <Stack
              key={passenger.id}
              direction="row"
              sx={{ justifyContent: 'space-between', gap: 1 }}
            >
              <Typography variant="body2">{formatPassengerLabel(passenger)}</Typography>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'baseline' }}>
                <Typography variant="subtitle2">{seat?.label ?? '—'}</Typography>
                {seat && seat.price > 0 ? (
                  <Typography variant="caption" color="text.secondary">
                    {formatBookingMoney(seat.price, booking.priceBreakdown.currency)}
                  </Typography>
                ) : null}
              </Stack>
            </Stack>
          );
        })}
        {hasInfants ? (
          <Typography variant="caption" color="text.secondary">
            Infants travel on an adult’s lap and are not assigned seats.
          </Typography>
        ) : null}
      </Stack>
    </BookingDetailSection>
  );
}
