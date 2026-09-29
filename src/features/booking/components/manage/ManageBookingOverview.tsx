import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router-dom';
import { AppAlert, AppButton, AppCard } from '@/components/common';
import { APP_ROUTES } from '@/constants/routes';
import { serializeFlightSearchCriteria } from '@/features/flights';
import { todayIsoDate } from '@/features/flights/utils/dates';
import {
  CHANGE_BOOKING_QUERY,
  MANAGE_BOOKING_SECTIONS,
  type ManageBookingSection,
} from '../../constants/manageBooking';
import type { Booking } from '../../types/bookingRecord';
import { canChangeFlight } from '../../utils/bookingStatus';
import { formatBookingMoney } from '../../utils/formatMoney';

export interface ManageBookingOverviewProps {
  booking: Booking;
  onSelectSection: (section: ManageBookingSection) => void;
}

export function ManageBookingOverview({ booking, onSelectSection }: ManageBookingOverviewProps) {
  const todayIso = todayIsoDate();
  const flightChangeAllowed = canChangeFlight(booking, todayIso);

  const flightChangeSearch = (() => {
    const params = booking.searchCriteria
      ? serializeFlightSearchCriteria(booking.searchCriteria)
      : new URLSearchParams({
          from: booking.flight.origin.code,
          to: booking.flight.destination.code,
          departure: booking.flight.departureTime.slice(0, 10),
          adults: String(
            Math.max(
              booking.passengers.filter((passenger) => passenger.type === 'ADULT').length,
              1,
            ),
          ),
          children: String(
            booking.passengers.filter((passenger) => passenger.type === 'CHILD').length,
          ),
          infants: String(
            booking.passengers.filter((passenger) => passenger.type === 'INFANT').length,
          ),
          cabin: booking.cabinClass,
        });
    params.set(CHANGE_BOOKING_QUERY, booking.reference);
    return `${APP_ROUTES.customer.flights}?${params.toString()}`;
  })();

  return (
    <Stack spacing={2.5}>
      <AppCard
        title="Manage booking"
        subtitle={`${booking.reference} · ${booking.flight.origin.code} → ${booking.flight.destination.code}`}
      >
        <Typography variant="body2" color="text.secondary">
          Current total{' '}
          <strong>
            {formatBookingMoney(
              booking.priceBreakdown.finalTotal,
              booking.priceBreakdown.currency,
            )}
          </strong>
          . Changes update this booking immediately after you save.
        </Typography>
      </AppCard>

      <Stack spacing={1.5}>
        {MANAGE_BOOKING_SECTIONS.map((section) => {
          if (section.id === 'flight') {
            return (
              <AppCard key={section.id} title={section.label} subtitle={section.description}>
                {flightChangeAllowed ? (
                  <Stack spacing={1.25}>
                    <Typography variant="body2" color="text.secondary">
                      Search for a replacement flight. We’ll show original fare, new fare, change
                      fee, and any amount due or refund before applying.
                    </Typography>
                    <AppButton
                      component={RouterLink}
                      to={flightChangeSearch}
                      variant="contained"
                      sx={{ alignSelf: 'flex-start' }}
                    >
                      Search new flight
                    </AppButton>
                  </Stack>
                ) : (
                  <AppAlert severity="warning" title="Flight change unavailable">
                    This booking cannot be changed right now (status, departure date, or fare rules).
                  </AppAlert>
                )}
              </AppCard>
            );
          }

          return (
            <AppCard key={section.id} title={section.label} subtitle={section.description}>
              <AppButton
                variant="outlined"
                onClick={() => onSelectSection(section.id)}
                sx={{ alignSelf: 'flex-start' }}
              >
                Open
              </AppButton>
            </AppCard>
          );
        })}
      </Stack>
    </Stack>
  );
}
