import Stack from '@mui/material/Stack';
import type { Booking } from '../../types/bookingRecord';
import { BookingAddonsDetail } from '../detail/BookingAddonsDetail';
import { BookingBaggageDetail } from '../detail/BookingBaggageDetail';
import { BookingFlightDetail } from '../detail/BookingFlightDetail';
import { BookingMealsDetail } from '../detail/BookingMealsDetail';
import { BookingPassengersDetail } from '../detail/BookingPassengersDetail';
import { BookingPaymentDetail } from '../detail/BookingPaymentDetail';
import { BookingSeatsDetail } from '../detail/BookingSeatsDetail';

export interface BookingConfirmationDetailsProps {
  booking: Booking;
}

export function BookingConfirmationDetails({ booking }: BookingConfirmationDetailsProps) {
  return (
    <Stack spacing={2.5} id="booking-confirmation-print">
      <BookingFlightDetail booking={booking} />
      <BookingPassengersDetail booking={booking} />
      <BookingSeatsDetail booking={booking} />
      <BookingBaggageDetail booking={booking} />
      <BookingMealsDetail booking={booking} />
      <BookingAddonsDetail booking={booking} />
      <BookingPaymentDetail booking={booking} />
    </Stack>
  );
}
