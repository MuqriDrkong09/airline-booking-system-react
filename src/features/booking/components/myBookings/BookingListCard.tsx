import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {
  CalendarDays,
  Eye,
  LogIn,
  Plane,
  Settings2,
  Ticket,
  Users,
  XCircle,
} from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';
import { AppBadge, AppButton, AppCard } from '@/components/common';
import { APP_ROUTES } from '@/constants/routes';
import { formatFlightDate } from '@/features/flights/utils/flightResults';
import type { Booking } from '../../types/bookingRecord';
import { formatBookingMoney } from '../../utils/formatMoney';
import {
  BOOKING_STATUS_LABELS,
  BOOKING_STATUS_TONE,
  canCheckInBooking,
  canDownloadTicket,
  canManageBooking,
} from '../../utils/bookingStatus';
import { canCancelBooking } from '../../utils/cancellationQuote';

export interface BookingListCardProps {
  booking: Booking;
  todayIso: string;
  onCancel: (booking: Booking) => void;
}

export function BookingListCard({
  booking,
  todayIso,
  onCancel,
}: BookingListCardProps) {
  const { flight } = booking;
  const route = `${flight.origin.code} → ${flight.destination.code}`;
  const passengerLabel =
    booking.passengers.length === 1
      ? '1 passenger'
      : `${booking.passengers.length} passengers`;

  const showManage = canManageBooking(booking);
  const showCancel = canCancelBooking(booking, todayIso);
  const showCheckIn = canCheckInBooking(booking, todayIso);
  const showDownload = canDownloadTicket(booking);

  return (
    <AppCard
      outlined
      sx={{
        '& .MuiCardContent-root': {
          p: 2,
          '&:last-child': { pb: 2 },
        },
      }}
    >
      <Stack spacing={1.75}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          sx={{ alignItems: { sm: 'flex-start' }, justifyContent: 'space-between' }}
        >
          <Stack spacing={0.5} sx={{ minWidth: 0 }}>
            <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 0.8 }}>
              Booking reference
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, wordBreak: 'break-all' }}>
              {booking.reference}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {flight.airline.name} · {flight.flightNumber}
            </Typography>
          </Stack>
          <AppBadge
            label={BOOKING_STATUS_LABELS[booking.status]}
            tone={BOOKING_STATUS_TONE[booking.status]}
          />
        </Stack>

        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={1.5}
          useFlexGap
          sx={{ flexWrap: 'wrap', color: 'text.secondary' }}
        >
          <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
            <Plane size={16} aria-hidden />
            <Typography variant="body2" color="text.primary" sx={{ fontWeight: 600 }}>
              {route}
            </Typography>
            <Typography variant="body2">
              {flight.origin.city} to {flight.destination.city}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
            <CalendarDays size={16} aria-hidden />
            <Typography variant="body2">{formatFlightDate(flight.departureTime)}</Typography>
          </Stack>
          <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
            <Users size={16} aria-hidden />
            <Typography variant="body2">{passengerLabel}</Typography>
          </Stack>
        </Stack>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.25}
          sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between' }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {formatBookingMoney(
              booking.priceBreakdown.finalTotal,
              booking.priceBreakdown.currency,
            )}
          </Typography>

          <Stack
            direction="row"
            spacing={1}
            useFlexGap
            sx={{ flexWrap: 'wrap', justifyContent: { xs: 'stretch', sm: 'flex-end' } }}
          >
            <AppButton
              component={RouterLink}
              to={APP_ROUTES.customer.bookingDetail(booking.reference)}
              variant="outlined"
              size="small"
              startIcon={<Eye size={16} aria-hidden />}
            >
              View
            </AppButton>
            {showManage ? (
            <AppButton
              component={RouterLink}
              to={APP_ROUTES.customer.bookingManage(booking.reference)}
              variant="outlined"
              size="small"
              startIcon={<Settings2 size={16} aria-hidden />}
            >
              Manage
            </AppButton>
            ) : null}
            {showCancel ? (
              <AppButton
                variant="outlined"
                color="error"
                size="small"
                startIcon={<XCircle size={16} aria-hidden />}
                onClick={() => onCancel(booking)}
              >
                Cancel
              </AppButton>
            ) : null}
            {showCheckIn ? (
              <AppButton
                component={RouterLink}
                to={`${APP_ROUTES.customer.checkIn}?reference=${encodeURIComponent(booking.reference)}`}
                variant="contained"
                size="small"
                startIcon={<LogIn size={16} aria-hidden />}
              >
                Check-in
              </AppButton>
            ) : null}
            {showDownload ? (
              <AppButton
                component={RouterLink}
                to={APP_ROUTES.customer.bookingETicket(booking.reference)}
                variant="outlined"
                size="small"
                startIcon={<Ticket size={16} aria-hidden />}
              >
                E-ticket
              </AppButton>
            ) : null}
          </Stack>
        </Stack>
      </Stack>
    </AppCard>
  );
}
