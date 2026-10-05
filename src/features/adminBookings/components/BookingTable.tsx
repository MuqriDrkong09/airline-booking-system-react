import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TablePagination from '@mui/material/TablePagination';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { Ban, Banknote, Eye, Pencil } from 'lucide-react';
import type { ReactNode } from 'react';
import {
  AppBadge,
  AppButton,
  AppCard,
  AppTable,
  type AppTableColumn,
} from '@/components/common';
import {
  BOOKING_STATUS_LABELS,
  BOOKING_STATUS_TONE,
  canCancelBooking,
  formatBookingMoney,
} from '@/features/booking';
import { todayIsoDate } from '@/features/flights/utils/dates';
import type { AdminBooking, AdminBookingListQuery } from '../types/adminBooking';
import { canModifyBooking, canRefundBooking } from '../utils/adminBookingActions';

export interface BookingTableProps {
  bookings: readonly AdminBooking[];
  total: number;
  query: AdminBookingListQuery;
  onQueryChange: (query: AdminBookingListQuery) => void;
  onView: (booking: AdminBooking) => void;
  onCancel: (booking: AdminBooking) => void;
  onRefund: (booking: AdminBooking) => void;
  onModify: (booking: AdminBooking) => void;
}

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <Box sx={{ display: 'grid', gap: 0.5 }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" component="div" sx={{ wordBreak: 'break-word' }}>
        {value}
      </Typography>
    </Box>
  );
}

function BookingMobileCard({
  booking,
  todayIso,
  onView,
  onCancel,
  onRefund,
  onModify,
}: {
  booking: AdminBooking;
  todayIso: string;
  onView: (booking: AdminBooking) => void;
  onCancel: (booking: AdminBooking) => void;
  onRefund: (booking: AdminBooking) => void;
  onModify: (booking: AdminBooking) => void;
}) {
  const primary = booking.passengers[0];

  return (
    <AppCard
      title={booking.reference}
      subtitle={`${booking.flight.flightNumber} · ${booking.flight.origin.code}→${booking.flight.destination.code}`}
      action={
        <IconButton
          aria-label={`View ${booking.reference}`}
          size="small"
          onClick={() => onView(booking)}
        >
          <Eye aria-hidden="true" size={16} />
        </IconButton>
      }
    >
      <Box
        sx={{
          display: 'grid',
          gap: 1.5,
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        }}
      >
        <InfoRow
          label="Passenger"
          value={primary ? `${primary.firstName} ${primary.lastName}` : '—'}
        />
        <InfoRow
          label="Status"
          value={
            <AppBadge
              label={BOOKING_STATUS_LABELS[booking.status]}
              tone={BOOKING_STATUS_TONE[booking.status]}
            />
          }
        />
        <InfoRow label="Departure" value={booking.flight.departureTime.replace('T', ' ')} />
        <InfoRow
          label="Total"
          value={formatBookingMoney(
            booking.priceBreakdown.finalTotal,
            booking.priceBreakdown.currency,
          )}
        />
        <Box sx={{ gridColumn: '1 / -1', display: 'grid', gap: 1 }}>
          {canModifyBooking(booking) ? (
            <AppButton size="small" variant="outlined" onClick={() => onModify(booking)}>
              Modify
            </AppButton>
          ) : null}
          {canCancelBooking(booking, todayIso) ? (
            <AppButton
              size="small"
              variant="outlined"
              color="error"
              onClick={() => onCancel(booking)}
            >
              Cancel
            </AppButton>
          ) : null}
          {canRefundBooking(booking, todayIso) ? (
            <AppButton size="small" variant="outlined" onClick={() => onRefund(booking)}>
              Refund
            </AppButton>
          ) : null}
        </Box>
      </Box>
    </AppCard>
  );
}

export function BookingTable({
  bookings,
  total,
  query,
  onQueryChange,
  onView,
  onCancel,
  onRefund,
  onModify,
}: BookingTableProps) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'), { defaultMatches: true });
  const todayIso = todayIsoDate();

  const handleSort = (columnId: string) => {
    if (query.sortBy === columnId) {
      onQueryChange({
        ...query,
        sortDir: query.sortDir === 'asc' ? 'desc' : 'asc',
        page: 1,
      });
      return;
    }
    onQueryChange({
      ...query,
      sortBy: columnId as AdminBookingListQuery['sortBy'],
      sortDir: 'asc',
      page: 1,
    });
  };

  const columns: AppTableColumn<AdminBooking>[] = [
    {
      id: 'reference',
      header: 'Reference',
      sortable: true,
      cell: (booking) => <strong>{booking.reference}</strong>,
    },
    {
      id: 'flight',
      header: 'Flight',
      sortable: true,
      cell: (booking) =>
        `${booking.flight.flightNumber} · ${booking.flight.origin.code}→${booking.flight.destination.code}`,
    },
    {
      id: 'departure',
      header: 'Departure',
      sortable: true,
      cell: (booking) => booking.flight.departureTime.replace('T', ' '),
    },
    {
      id: 'status',
      header: 'Status',
      sortable: true,
      cell: (booking) => (
        <AppBadge
          label={BOOKING_STATUS_LABELS[booking.status]}
          tone={BOOKING_STATUS_TONE[booking.status]}
        />
      ),
    },
    {
      id: 'total',
      header: 'Total',
      align: 'right',
      sortable: true,
      cell: (booking) =>
        formatBookingMoney(booking.priceBreakdown.finalTotal, booking.priceBreakdown.currency),
    },
    {
      id: 'createdAt',
      header: 'Created',
      sortable: true,
      cell: (booking) => booking.createdAt.slice(0, 10),
    },
    {
      id: 'actions',
      header: 'Actions',
      align: 'right',
      cell: (booking) => (
        <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'flex-end' }}>
          <IconButton
            aria-label={`View ${booking.reference}`}
            size="small"
            onClick={() => onView(booking)}
          >
            <Eye aria-hidden="true" size={16} />
          </IconButton>
          <IconButton
            aria-label={`Modify ${booking.reference}`}
            size="small"
            disabled={!canModifyBooking(booking)}
            onClick={() => onModify(booking)}
          >
            <Pencil aria-hidden="true" size={16} />
          </IconButton>
          <IconButton
            aria-label={`Cancel ${booking.reference}`}
            size="small"
            color="error"
            disabled={!canCancelBooking(booking, todayIso)}
            onClick={() => onCancel(booking)}
          >
            <Ban aria-hidden="true" size={16} />
          </IconButton>
          <IconButton
            aria-label={`Refund ${booking.reference}`}
            size="small"
            disabled={!canRefundBooking(booking, todayIso)}
            onClick={() => onRefund(booking)}
          >
            <Banknote aria-hidden="true" size={16} />
          </IconButton>
        </Stack>
      ),
    },
  ];

  if (!isDesktop) {
    return (
      <Stack spacing={2} component="section" aria-label="Admin bookings">
        {bookings.length === 0 ? (
          <Box role="status" sx={{ py: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">No bookings match your filters.</Typography>
          </Box>
        ) : (
          bookings.map((booking) => (
            <BookingMobileCard
              key={booking.id}
              booking={booking}
              todayIso={todayIso}
              onView={onView}
              onCancel={onCancel}
              onRefund={onRefund}
              onModify={onModify}
            />
          ))
        )}
        <TablePagination
          component="div"
          count={total}
          page={query.page - 1}
          onPageChange={(_event, page) => onQueryChange({ ...query, page: page + 1 })}
          rowsPerPage={query.pageSize}
          onRowsPerPageChange={(event) =>
            onQueryChange({
              ...query,
              pageSize: Number.parseInt(event.target.value, 10),
              page: 1,
            })
          }
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Stack>
    );
  }

  return (
    <AppTable
      ariaLabel="Admin bookings"
      columns={columns}
      rows={bookings}
      getRowId={(booking) => booking.id}
      emptyMessage="No bookings match your filters."
      dense
      stickyHeader
      sortBy={query.sortBy}
      sortDirection={query.sortDir}
      onSortChange={handleSort}
      page={query.page - 1}
      pageSize={query.pageSize}
      totalCount={total}
      onPageChange={(page) => onQueryChange({ ...query, page: page + 1 })}
      onPageSizeChange={(pageSize) => onQueryChange({ ...query, pageSize, page: 1 })}
    />
  );
}
