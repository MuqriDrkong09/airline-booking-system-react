import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router-dom';
import { AppAlert, AppButton, AppCard } from '@/components/common';
import { APP_ROUTES } from '@/constants/routes';
import type { Booking, BookingPassenger } from '../../types/bookingRecord';
import { formatPassengerLabel } from '../../utils/bookingDetailHelpers';
import { BOOKING_STATUS_LABELS } from '../../utils/bookingStatus';

export interface CheckInResultStepProps {
  booking: Booking;
  checkedInPassengers: BookingPassenger[];
  onStartOver: () => void;
}

export function CheckInResultStep({
  booking,
  checkedInPassengers,
  onStartOver,
}: CheckInResultStepProps) {
  return (
    <AppCard title="Check-in complete" subtitle="Your boarding passes are ready.">
      <Stack spacing={2}>
        <AppAlert severity="success" title={BOOKING_STATUS_LABELS[booking.status]}>
          Booking {booking.reference} is checked in for{' '}
          {checkedInPassengers.map((passenger) => formatPassengerLabel(passenger)).join(', ')}.
        </AppAlert>

        <Typography variant="body2" color="text.secondary">
          Download or print your e-ticket, or open the booking for full details.
        </Typography>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} useFlexGap>
          <AppButton
            component={RouterLink}
            to={APP_ROUTES.customer.bookingETicket(booking.reference)}
            variant="contained"
          >
            View e-ticket
          </AppButton>
          <AppButton
            component={RouterLink}
            to={APP_ROUTES.customer.bookingDetail(booking.reference)}
            variant="outlined"
          >
            View booking
          </AppButton>
          <AppButton variant="text" onClick={onStartOver}>
            Check in another booking
          </AppButton>
        </Stack>
      </Stack>
    </AppCard>
  );
}
