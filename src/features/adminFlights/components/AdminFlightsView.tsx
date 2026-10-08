import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import type { FlightOperationalStatus } from '@/features/flights';
import {
  AppAlert,
  AppButton,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  TableSkeleton,
} from '@/components/common';
import {
  useAdminFlightsQuery,
  useCreateAdminFlightMutation,
  useDeleteAdminFlightMutation,
  useUpdateAdminFlightMutation,
  useUpdateAdminFlightStatusMutation,
} from '../hooks/useAdminFlights';
import type { FlightFormParsedValues } from '../schemas/flightFormSchema';
import {
  EMPTY_ADMIN_FLIGHT_FILTERS,
  type AdminFlight,
  type AdminFlightFilters,
} from '../types/adminFlight';
import { FlightDialog } from './FlightDialog';
import { FlightFilters } from './FlightFilters';
import { FlightTable } from './FlightTable';

type DialogState =
  | { mode: 'closed' }
  | { mode: 'create' }
  | { mode: 'edit'; flight: AdminFlight };

export function AdminFlightsView() {
  const [filters, setFilters] = useState<AdminFlightFilters>(EMPTY_ADMIN_FLIGHT_FILTERS);
  const [dialog, setDialog] = useState<DialogState>({ mode: 'closed' });
  const [deleteTarget, setDeleteTarget] = useState<AdminFlight | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const listQuery = useAdminFlightsQuery(filters);
  const createMutation = useCreateAdminFlightMutation();
  const updateMutation = useUpdateAdminFlightMutation();
  const statusMutation = useUpdateAdminFlightStatusMutation();
  const deleteMutation = useDeleteAdminFlightMutation();

  const submitting = createMutation.isPending || updateMutation.isPending;

  if (listQuery.isPending && !listQuery.data) {
    return (
      <Stack spacing={3}>
        <Skeleton width={140} />
        <FlightFilters value={filters} onChange={setFilters} />
        <TableSkeleton columnCount={7} rowCount={6} showToolbar={false} />
      </Stack>
    );
  }

  if (listQuery.isError) {
    return (
      <ErrorState
        title="Unable to load flights"
        message="Please try again in a moment."
        onRetry={() => {
          void listQuery.refetch();
        }}
      />
    );
  }

  const flights = listQuery.data ?? [];

  const handleSubmit = async (values: FlightFormParsedValues) => {
    setActionError(null);
    try {
      if (dialog.mode === 'create') {
        await createMutation.mutateAsync(values);
      } else if (dialog.mode === 'edit') {
        await updateMutation.mutateAsync({
          flightId: dialog.flight.id,
          input: values,
        });
      }
      setDialog({ mode: 'closed' });
    } catch {
      setActionError('Unable to save the flight. Please try again.');
    }
  };

  const handleStatusChange = async (
    flight: AdminFlight,
    status: FlightOperationalStatus,
  ) => {
    if (flight.status === status) {
      return;
    }
    setActionError(null);
    try {
      await statusMutation.mutateAsync({ flightId: flight.id, status });
    } catch {
      setActionError(`Unable to update status for ${flight.flightNumber}.`);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }
    setActionError(null);
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    } catch {
      setActionError(`Unable to delete ${deleteTarget.flightNumber}.`);
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
          {flights.length} flight{flights.length === 1 ? '' : 's'}
        </Typography>
        <AppButton
          variant="contained"
          onClick={() => {
            setActionError(null);
            setDialog({ mode: 'create' });
          }}
        >
          Create flight
        </AppButton>
      </Stack>

      <FlightFilters value={filters} onChange={setFilters} />

      {actionError ? (
        <AppAlert severity="error" onClose={() => setActionError(null)}>
          {actionError}
        </AppAlert>
      ) : null}

      {flights.length === 0 ? (
        <EmptyState
          title="No flights found"
          message="Try clearing filters or create a new flight."
          action={
            <AppButton
              variant="contained"
              onClick={() => {
                setActionError(null);
                setDialog({ mode: 'create' });
              }}
            >
              Create flight
            </AppButton>
          }
        />
      ) : (
        <FlightTable
          flights={flights}
          statusUpdatingId={statusMutation.isPending ? statusMutation.variables?.flightId : null}
          onEdit={(flight) => {
            setActionError(null);
            setDialog({ mode: 'edit', flight });
          }}
          onDelete={setDeleteTarget}
          onStatusChange={(flight, status) => {
            void handleStatusChange(flight, status);
          }}
        />
      )}

      <FlightDialog
        open={dialog.mode === 'create' || dialog.mode === 'edit'}
        mode={dialog.mode === 'edit' ? 'edit' : 'create'}
        flight={dialog.mode === 'edit' ? dialog.flight : null}
        submitting={submitting}
        onClose={() => setDialog({ mode: 'closed' })}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete flight"
        description={
          deleteTarget
            ? `Delete ${deleteTarget.flightNumber} (${deleteTarget.origin} → ${deleteTarget.destination})? This cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        confirmColor="error"
        loading={deleteMutation.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          void handleDelete();
        }}
      />
    </Stack>
  );
}
