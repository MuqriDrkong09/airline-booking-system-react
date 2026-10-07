import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Ticket } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { AppAlert, AppButton, EmptyState, SectionHeader } from '@/components/common';
import { APP_ROUTES } from '@/constants/routes';
import {
  BookingCancellationDialog,
  BookingListCard,
  BOOKING_STATUS_LABELS,
  queryMyBookings,
  useBookingsStore,
  type Booking,
} from '@/features/booking';
import { todayIsoDate } from '@/features/flights/utils/dates';

const UPCOMING_PREVIEW_SIZE = 3;

export function CustomerHomeUpcomingTrips() {
  const bookings = useBookingsStore((state) => state.bookings);
  const todayIso = todayIsoDate();
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const upcoming = useMemo(
    () =>
      queryMyBookings(bookings, {
        tab: 'upcoming',
        search: '',
        sort: 'departure_asc',
        page: 1,
        pageSize: UPCOMING_PREVIEW_SIZE,
        todayIso,
      }),
    [bookings, todayIso],
  );

  return (
    <Stack spacing={2}>
      <SectionHeader
        title="Upcoming trips"
        description="Your next departures, ready for check-in and trip management."
        action={
          <AppButton
            component={RouterLink}
            to={APP_ROUTES.customer.bookings}
            variant="text"
            color="inherit"
          >
            View all bookings
          </AppButton>
        }
      />

      {feedback ? (
        <AppAlert severity="success" onClose={() => setFeedback(null)}>
          {feedback}
        </AppAlert>
      ) : null}

      {upcoming.total === 0 ? (
        <EmptyState
          icon={<Ticket aria-hidden size={40} />}
          title="No upcoming trips"
          message="Search for a flight and complete a booking to see your trips here."
          action={
            <AppButton
              component={RouterLink}
              to={APP_ROUTES.customer.flights}
              variant="contained"
            >
              Search flights
            </AppButton>
          }
        />
      ) : (
        <Stack spacing={1.75}>
          <Typography variant="body2" color="text.secondary">
            Showing {upcoming.items.length} of {upcoming.counts.upcoming} upcoming
          </Typography>
          {upcoming.items.map((booking) => (
            <BookingListCard
              key={booking.id}
              booking={booking}
              todayIso={todayIso}
              onCancel={setCancelTarget}
            />
          ))}
        </Stack>
      )}

      <BookingCancellationDialog
        open={Boolean(cancelTarget)}
        booking={cancelTarget}
        onClose={() => setCancelTarget(null)}
        onCompleted={(updated) => {
          setFeedback(
            `Booking ${updated.reference} is now ${BOOKING_STATUS_LABELS[updated.status].toLowerCase()}.`,
          );
        }}
      />
    </Stack>
  );
}
