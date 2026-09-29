import Stack from '@mui/material/Stack';
import type { Booking } from '../../types/bookingRecord';
import { BookingConfirmationActions } from '../confirmation/BookingConfirmationActions';
import { BookingAddonsDetail } from './BookingAddonsDetail';
import { BookingBaggageDetail } from './BookingBaggageDetail';
import { BookingCancellationPolicyDetail } from './BookingCancellationPolicyDetail';
import { BookingFlightDetail } from './BookingFlightDetail';
import { BookingInfoDetail } from './BookingInfoDetail';
import { BookingMealsDetail } from './BookingMealsDetail';
import { BookingPassengersDetail } from './BookingPassengersDetail';
import { BookingPaymentDetail } from './BookingPaymentDetail';
import { BookingSeatsDetail } from './BookingSeatsDetail';

export interface BookingDetailViewProps {
  booking: Booking;
  showActions?: boolean;
}

export function BookingDetailView({ booking, showActions = true }: BookingDetailViewProps) {
  return (
    <Stack spacing={2.5} sx={{ maxWidth: 880 }} id="booking-detail-print">
      <BookingInfoDetail booking={booking} />
      <BookingFlightDetail booking={booking} />
      <BookingPassengersDetail booking={booking} />
      <BookingSeatsDetail booking={booking} />
      <BookingBaggageDetail booking={booking} />
      <BookingMealsDetail booking={booking} />
      <BookingAddonsDetail booking={booking} />
      <BookingPaymentDetail booking={booking} />
      <BookingCancellationPolicyDetail booking={booking} />
      {showActions ? <BookingConfirmationActions booking={booking} /> : null}
    </Stack>
  );
}
