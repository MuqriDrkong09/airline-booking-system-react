import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import {
  AppAlert,
  AppButton,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  PageLoader,
} from '@/components/common';
import {
  useAdminAirportsQuery,
  useCreateAdminAirportMutation,
  useDeleteAdminAirportMutation,
  useSetAdminAirportActiveMutation,
  useUpdateAdminAirportMutation,
} from '../hooks/useAdminAirports';
import type { AirportFormParsedValues } from '../schemas/airportFormSchema';
import {
  EMPTY_ADMIN_AIRPORT_FILTERS,
  type AdminAirport,
  type AdminAirportFilters,
} from '../types/adminAirport';
import { toAdminAirportInput } from '../utils/formatAdminAirport';
import { AirportDialog } from './AirportDialog';
import { AirportFilters } from './AirportFilters';
import { AirportTable } from './AirportTable';

type DialogState =
  | { mode: 'closed' }
  | { mode: 'create' }
  | { mode: 'edit'; airport: AdminAirport };

export function AdminAirportsView() {
  const [filters, setFilters] = useState<AdminAirportFilters>(EMPTY_ADMIN_AIRPORT_FILTERS);
  const [dialog, setDialog] = useState<DialogState>({ mode: 'closed' });
  const [deleteTarget, setDeleteTarget] = useState<AdminAirport | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const listQuery = useAdminAirportsQuery(filters);
  const createMutation = useCreateAdminAirportMutation();
  const updateMutation = useUpdateAdminAirportMutation();
  const activeMutation = useSetAdminAirportActiveMutation();
  const deleteMutation = useDeleteAdminAirportMutation();

  const submitting = createMutation.isPending || updateMutation.isPending;

  if (listQuery.isLoading) {
    return <PageLoader label="Loading airports" />;
  }

  if (listQuery.isError) {
    return (
      <ErrorState
        title="Unable to load airports"
        message="Please try again in a moment."
        onRetry={() => {
          void listQuery.refetch();
        }}
      />
    );
  }

  const airports = listQuery.data ?? [];

  const handleSubmit = async (values: AirportFormParsedValues) => {
    setActionError(null);
    const input = toAdminAirportInput(values);
    try {
      if (dialog.mode === 'create') {
        await createMutation.mutateAsync(input);
      } else if (dialog.mode === 'edit') {
        await updateMutation.mutateAsync({
          airportId: dialog.airport.id,
          input,
        });
      }
      setDialog({ mode: 'closed' });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to save the airport. Please try again.';
      setActionError(message);
    }
  };

  const handleToggleActive = async (airport: AdminAirport) => {
    setActionError(null);
    try {
      await activeMutation.mutateAsync({
        airportId: airport.id,
        active: !airport.active,
      });
    } catch {
      setActionError(`Unable to update status for ${airport.code}.`);
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
      setActionError(`Unable to delete ${deleteTarget.code}.`);
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
          {airports.length} airport{airports.length === 1 ? '' : 's'}
        </Typography>
        <AppButton
          variant="contained"
          onClick={() => {
            setActionError(null);
            setDialog({ mode: 'create' });
          }}
        >
          Create airport
        </AppButton>
      </Stack>

      <AirportFilters value={filters} onChange={setFilters} />

      {actionError ? (
        <AppAlert severity="error" onClose={() => setActionError(null)}>
          {actionError}
        </AppAlert>
      ) : null}

      {airports.length === 0 ? (
        <EmptyState
          title="No airports found"
          message="Try clearing filters or create a new airport."
          action={
            <AppButton
              variant="contained"
              onClick={() => {
                setActionError(null);
                setDialog({ mode: 'create' });
              }}
            >
              Create airport
            </AppButton>
          }
        />
      ) : (
        <AirportTable
          airports={airports}
          activeUpdatingId={
            activeMutation.isPending ? activeMutation.variables?.airportId : null
          }
          onEdit={(airport) => {
            setActionError(null);
            setDialog({ mode: 'edit', airport });
          }}
          onDelete={setDeleteTarget}
          onToggleActive={(airport) => {
            void handleToggleActive(airport);
          }}
        />
      )}

      <AirportDialog
        open={dialog.mode === 'create' || dialog.mode === 'edit'}
        mode={dialog.mode === 'edit' ? 'edit' : 'create'}
        airport={dialog.mode === 'edit' ? dialog.airport : null}
        submitting={submitting}
        onClose={() => setDialog({ mode: 'closed' })}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete airport"
        description={
          deleteTarget
            ? `Delete ${deleteTarget.code} (${deleteTarget.name})? This cannot be undone.`
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
