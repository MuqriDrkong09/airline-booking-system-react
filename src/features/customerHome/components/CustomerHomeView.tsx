import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Bell, CalendarCheck, Heart, Ticket } from 'lucide-react';
import { useMemo } from 'react';
import { getDisplayName, useAuth } from '@/features/auth';
import {
  canCheckInBooking,
  queryMyBookings,
  useBookingsStore,
} from '@/features/booking';
import { useFavouritesQuery } from '@/features/favourites';
import { RecentSearchesSection } from '@/features/flights';
import { todayIsoDate } from '@/features/flights/utils/dates';
import { useUnreadNotificationCountQuery } from '@/features/notifications';
import { APP_ROUTES } from '@/constants/routes';
import { CustomerHomeQuickActions } from './CustomerHomeQuickActions';
import { CustomerHomeStatCard } from './CustomerHomeStatCard';
import { CustomerHomeUpcomingTrips } from './CustomerHomeUpcomingTrips';

function formatCount(value: number): string {
  return new Intl.NumberFormat(undefined).format(value);
}

export function CustomerHomeView() {
  const { user } = useAuth();
  const bookings = useBookingsStore((state) => state.bookings);
  const todayIso = todayIsoDate();
  const favouritesQuery = useFavouritesQuery();
  const unreadQuery = useUnreadNotificationCountQuery();

  const stats = useMemo(() => {
    const upcoming = queryMyBookings(bookings, {
      tab: 'upcoming',
      search: '',
      sort: 'departure_asc',
      page: 1,
      pageSize: 1,
      todayIso,
    });
    const checkInReady = bookings.filter((booking) =>
      canCheckInBooking(booking, todayIso),
    ).length;

    return {
      upcoming: upcoming.counts.upcoming,
      checkInReady,
      favourites: favouritesQuery.data?.length ?? 0,
      unread: unreadQuery.data ?? 0,
    };
  }, [bookings, favouritesQuery.data, todayIso, unreadQuery.data]);

  const displayName = user ? getDisplayName(user) : 'traveler';

  return (
    <Stack spacing={3.5}>
      <Box>
        <Typography variant="h5" component="h2" sx={{ fontWeight: 700 }}>
          Welcome back, {displayName}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
          Plan your next trip, manage upcoming bookings, and jump into check-in from one place.
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
            lg: 'repeat(4, minmax(0, 1fr))',
          },
        }}
      >
        <CustomerHomeStatCard
          label="Upcoming trips"
          value={formatCount(stats.upcoming)}
          helperText="Ready to travel"
          icon={Ticket}
          to={APP_ROUTES.customer.bookings}
          tone="info"
        />
        <CustomerHomeStatCard
          label="Check-in ready"
          value={formatCount(stats.checkInReady)}
          helperText="Open for online check-in"
          icon={CalendarCheck}
          to={APP_ROUTES.customer.checkIn}
          tone="success"
        />
        <CustomerHomeStatCard
          label="Favourites"
          value={formatCount(stats.favourites)}
          helperText="Saved flight offers"
          icon={Heart}
          to={APP_ROUTES.customer.favourites}
        />
        <CustomerHomeStatCard
          label="Unread alerts"
          value={formatCount(stats.unread)}
          helperText="Notifications waiting"
          icon={Bell}
          to={APP_ROUTES.customer.notifications}
          tone="warning"
        />
      </Box>

      <CustomerHomeQuickActions />
      <CustomerHomeUpcomingTrips />
      <RecentSearchesSection />
    </Stack>
  );
}
