import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useMemo, useState } from 'react';
import {
  AppAlert,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  PageLoader,
} from '@/components/common';
import {
  BookingCancellationDialog,
  calculateCancellationQuote,
  canCancelBooking,
  formatBookingMoney,
} from '@/features/booking';
import { todayIsoDate } from '@/features/flights/utils/dates';
import {
  useAdminBookingFlightOptionsQuery,
  useAdminBookingsQuery,
  useCancelAdminBookingMutation,
  useModifyAdminBookingMutation,
  useRefundAdminBookingMutation,
} from '../hooks/useAdminBookings';
import {
  EMPTY_ADMIN_BOOKING_QUERY,
  type AdminBooking,
  type AdminBookingListQuery,
  type AdminBookingModifyInput,
} from '../types/adminBooking';
import { canModifyBooking, canRefundBooking } from '../utils/adminBookingActions';
import { BookingDetailsDialog } from './BookingDetailsDialog';
import { BookingFilters } from './BookingFilters';
import { BookingModifyDialog } from './BookingModifyDialog';
import { BookingTable } from './BookingTable';

type DialogState =
  | { mode: 'closed' }
  | { mode: 'view'; booking: AdminBooking }
  | { mode: 'modify'; booking: AdminBooking }
  | { mode: 'cancel'; booking: AdminBooking }
  | { mode: 'refund'; booking: AdminBooking };

export function AdminBookingsView() {
  const [query, setQuery] = useState<AdminBookingListQuery>(EMPTY_ADMIN_BOOKING_QUERY);
  const [dialog, setDialog] = useState<DialogState>({ mode: 'closed' });
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const listQuery = useAdminBookingsQuery(query);
  const flightOptionsQuery = useAdminBookingFlightOptionsQuery();
  const cancelMutation = useCancelAdminBookingMutation();
  const refundMutation = useRefundAdminBookingMutation();
  const modifyMutation = useModifyAdminBookingMutation();

  const todayIso = todayIsoDate();
  const refundTarget = dialog.mode === 'refund' ? dialog.booking : null;
  const refundQuote = useMemo(
    () => (refundTarget ? calculateCancellationQuote(refundTarget) : null),
    [refundTarget],
  );

  if (listQuery.isPending && !listQuery.data) {
    return <PageLoader label="Loading bookings" />;
  }

  if (listQuery.isError || !listQuery.data) {
    return (
      <ErrorState
        title="Unable to load bookings"
        message="Please try again in a moment."
        onRetry={() => {
          void listQuery.refetch();
        }}
      />
    );
  }

  const { items, total } = listQuery.data;

  const handleModify = async (input: AdminBookingModifyInput) => {
    if (dialog.mode !== 'modify') {
      return;
    }
    setActionError(null);
    const booking = await modifyMutation.mutateAsync({
      reference: dialog.booking.reference,
      input,
    });
    setActionSuccess(`Updated contact details for ${booking.reference}.`);
    setDialog({ mode: 'closed' });
  };

  const handleRefundConfirm = async () => {
    if (dialog.mode !== 'refund') {
      return;
    }
    setActionError(null);
    try {
      const booking = await refundMutation.mutateAsync(dialog.booking.reference);
      setActionSuccess(`Refund processed for ${booking.reference}.`);
      setDialog({ mode: 'closed' });
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Unable to refund booking.');
    }
  };

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' } }}
      >
        <Typography variant="body2" color="text.secondary">
          {total} booking{total === 1 ? '' : 's'}
        </Typography>
      </Stack>

      <BookingFilters
        value={query}
        flightOptions={flightOptionsQuery.data ?? []}
        onChange={setQuery}
      />

      {actionError ? (
        <AppAlert severity="error" onClose={() => setActionError(null)}>
          {actionError}
        </AppAlert>
      ) : null}
      {actionSuccess ? (
        <AppAlert severity="success" onClose={() => setActionSuccess(null)}>
          {actionSuccess}
        </AppAlert>
      ) : null}

      {total === 0 && !query.search && !query.status && !query.flight && !query.dateFrom && !query.dateTo ? (
        <EmptyState
          title="No bookings yet"
          message="Bookings will appear here once customers complete checkout, or use the mock seed data in development."
        />
      ) : (
        <BookingTable
          bookings={items}
          total={total}
          query={query}
          onQueryChange={setQuery}
          onView={(booking) => {
            setActionError(null);
            setDialog({ mode: 'view', booking });
          }}
          onCancel={(booking) => {
            setActionError(null);
            setDialog({ mode: 'cancel', booking });
          }}
          onRefund={(booking) => {
            setActionError(null);
            setDialog({ mode: 'refund', booking });
          }}
          onModify={(booking) => {
            setActionError(null);
            setDialog({ mode: 'modify', booking });
          }}
        />
      )}

      <BookingDetailsDialog
        open={dialog.mode === 'view'}
        booking={dialog.mode === 'view' ? dialog.booking : null}
        onClose={() => setDialog({ mode: 'closed' })}
        onModify={
          dialog.mode === 'view' && canModifyBooking(dialog.booking)
            ? (booking) => setDialog({ mode: 'modify', booking })
            : undefined
        }
        onCancel={
          dialog.mode === 'view' && canCancelBooking(dialog.booking, todayIso)
            ? (booking) => setDialog({ mode: 'cancel', booking })
            : undefined
        }
        onRefund={
          dialog.mode === 'view' && canRefundBooking(dialog.booking, todayIso)
            ? (booking) => setDialog({ mode: 'refund', booking })
            : undefined
        }
      />

      <BookingModifyDialog
        open={dialog.mode === 'modify'}
        booking={dialog.mode === 'modify' ? dialog.booking : null}
        submitting={modifyMutation.isPending}
        onClose={() => setDialog({ mode: 'closed' })}
        onSubmit={handleModify}
      />

      <BookingCancellationDialog
        open={dialog.mode === 'cancel'}
        booking={dialog.mode === 'cancel' ? dialog.booking : null}
        onClose={() => setDialog({ mode: 'closed' })}
        cancelFn={async (reference) => cancelMutation.mutateAsync(reference)}
        onCompleted={(booking) => {
          setActionSuccess(`Cancelled ${booking.reference} (${booking.status}).`);
          void listQuery.refetch();
        }}
      />

      <ConfirmDialog
        open={dialog.mode === 'refund'}
        title="Refund booking"
        description={
          refundTarget
            ? refundTarget.status === 'CANCELLED'
              ? `Process an admin refund for ${refundTarget.reference}?`
              : `Cancel and refund ${refundTarget.reference}? Estimated refund: ${
                  refundQuote
                    ? formatBookingMoney(refundQuote.refundAmount, refundQuote.currency)
                    : '—'
                }`
            : ''
        }
        confirmLabel="Refund"
        confirmColor="warning"
        loading={refundMutation.isPending}
        onCancel={() => setDialog({ mode: 'closed' })}
        onConfirm={() => {
          void handleRefundConfirm();
        }}
      />
    </Stack>
  );
}
