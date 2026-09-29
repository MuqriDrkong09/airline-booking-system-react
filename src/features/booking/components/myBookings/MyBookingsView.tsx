import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Ticket } from 'lucide-react';
import {
  AppAlert,
  AppButton,
  EmptyState,
} from '@/components/common';
import { APP_ROUTES } from '@/constants/routes';
import { todayIsoDate } from '@/features/flights/utils/dates';
import type { Booking } from '../../types/bookingRecord';
import { useBookingsStore } from '../../store/bookingsStore';
import {
  buildETicketText,
  downloadTextFile,
} from '../../utils/bookingDocuments';
import { BOOKING_STATUS_LABELS, type MyBookingsTab } from '../../utils/bookingStatus';
import {
  MY_BOOKINGS_PAGE_SIZE,
  queryMyBookings,
  type MyBookingsSort,
} from '../../utils/myBookingsQuery';
import { BookingCancellationDialog } from '../cancellation/BookingCancellationDialog';
import { BookingListCard } from './BookingListCard';
import { MyBookingsToolbar } from './MyBookingsToolbar';

export function MyBookingsView() {
  const bookings = useBookingsStore((state) => state.bookings);
  const checkInBooking = useBookingsStore((state) => state.checkInBooking);

  const todayIso = todayIsoDate();
  const [tab, setTab] = useState<MyBookingsTab>('upcoming');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<MyBookingsSort>('departure_asc');
  const [page, setPage] = useState(1);
  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const result = useMemo(
    () =>
      queryMyBookings(bookings, {
        tab,
        search,
        sort,
        page,
        pageSize: MY_BOOKINGS_PAGE_SIZE,
        todayIso,
      }),
    [bookings, page, search, sort, tab, todayIso],
  );

  useEffect(() => {
    setPage(1);
  }, [tab, search, sort]);

  useEffect(() => {
    if (page !== result.page) {
      setPage(result.page);
    }
  }, [page, result.page]);

  const handleCheckIn = (booking: Booking) => {
    const updated = checkInBooking(booking.reference);
    if (updated) {
      setFeedback(`Check-in complete for ${updated.reference}.`);
    }
  };

  const handleDownloadTicket = (booking: Booking) => {
    downloadTextFile(
      `aerobook-eticket-${booking.reference}.txt`,
      buildETicketText(booking),
    );
    setFeedback(`E-ticket downloaded for ${booking.reference}.`);
  };

  const handleCancellationCompleted = (updated: Booking) => {
    setFeedback(
      `Booking ${updated.reference} is now ${BOOKING_STATUS_LABELS[updated.status].toLowerCase()}.`,
    );
    setTab('cancelled');
  };

  if (bookings.length === 0) {
    return (
      <EmptyState
        icon={<Ticket aria-hidden size={40} />}
        title="No bookings yet"
        message="When you complete a flight booking, it will appear here for viewing, check-in, and ticket download."
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
    );
  }

  return (
    <Stack spacing={2.5}>
      {feedback ? (
        <AppAlert severity="success" onClose={() => setFeedback(null)}>
          {feedback}
        </AppAlert>
      ) : null}

      <MyBookingsToolbar
        tab={tab}
        counts={result.counts}
        search={search}
        sort={sort}
        onTabChange={setTab}
        onSearchChange={setSearch}
        onSortChange={setSort}
      />

      {result.total === 0 ? (
        <EmptyState
          title={`No ${tab} bookings`}
          message={
            search
              ? 'Try a different search term or switch tabs.'
              : 'Nothing matches this tab yet.'
          }
        />
      ) : (
        <Stack spacing={1.75}>
          <Typography variant="body2" color="text.secondary">
            Showing {(result.page - 1) * MY_BOOKINGS_PAGE_SIZE + 1}–
            {Math.min(result.page * MY_BOOKINGS_PAGE_SIZE, result.total)} of{' '}
            {result.total}
          </Typography>

          {result.items.map((booking) => (
            <BookingListCard
              key={booking.id}
              booking={booking}
              todayIso={todayIso}
              onCancel={setCancelTarget}
              onCheckIn={handleCheckIn}
              onDownloadTicket={handleDownloadTicket}
            />
          ))}

          {result.pageCount > 1 ? (
            <Pagination
              color="primary"
              page={result.page}
              count={result.pageCount}
              onChange={(_, value) => setPage(value)}
              sx={{ alignSelf: 'center', pt: 1 }}
              aria-label="Bookings pagination"
            />
          ) : null}
        </Stack>
      )}

      <BookingCancellationDialog
        open={Boolean(cancelTarget)}
        booking={cancelTarget}
        onClose={() => setCancelTarget(null)}
        onCompleted={handleCancellationCompleted}
      />
    </Stack>
  );
}
