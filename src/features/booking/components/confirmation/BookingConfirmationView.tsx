import Stack from '@mui/material/Stack';
import { Link as RouterLink } from 'react-router-dom';
import { AppButton } from '@/components/common';
import { APP_ROUTES } from '@/constants/routes';
import type { Booking } from '../../types/bookingRecord';
import { BookingConfirmationActions } from './BookingConfirmationActions';
import { BookingConfirmationDetails } from './BookingConfirmationDetails';
import { BookingConfirmationSuccess } from './BookingConfirmationSuccess';

export interface BookingConfirmationViewProps {
  booking: Booking;
}

export function BookingConfirmationView({ booking }: BookingConfirmationViewProps) {
  return (
    <Stack spacing={2.5} sx={{ maxWidth: 880 }}>
      <BookingConfirmationSuccess booking={booking} />
      <BookingConfirmationActions booking={booking} />
      <BookingConfirmationDetails booking={booking} />

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        sx={{
          justifyContent: 'flex-end',
          alignItems: { xs: 'stretch', sm: 'center' },
          '@media print': { display: 'none' },
        }}
      >
        <AppButton component={RouterLink} to={APP_ROUTES.customer.flights} variant="contained">
          Book another flight
        </AppButton>
        <AppButton component={RouterLink} to={APP_ROUTES.customer.bookings} variant="outlined">
          My bookings
        </AppButton>
      </Stack>
    </Stack>
  );
}
