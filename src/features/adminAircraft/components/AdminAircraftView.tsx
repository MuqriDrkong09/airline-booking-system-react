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
  useAdminAircraftQuery,
  useCreateAdminAircraftMutation,
  useDeleteAdminAircraftMutation,
  useSetAdminAircraftActiveMutation,
  useUpdateAdminAircraftMutation,
} from '../hooks/useAdminAircraft';
import type { AircraftFormParsedValues } from '../schemas/aircraftFormSchema';
import {
  EMPTY_ADMIN_AIRCRAFT_FILTERS,
  type AdminAircraft,
  type AdminAircraftFilters,
} from '../types/adminAircraft';
import { formatAircraftLabel, toAdminAircraftInput } from '../utils/formatAdminAircraft';
import { AircraftDetailsDialog } from './AircraftDetailsDialog';
import { AircraftDialog } from './AircraftDialog';
import { AircraftFilters } from './AircraftFilters';
import { AircraftTable } from './AircraftTable';

type DialogState =
  | { mode: 'closed' }
  | { mode: 'create' }
  | { mode: 'edit'; aircraft: AdminAircraft }
  | { mode: 'view'; aircraft: AdminAircraft };

export function AdminAircraftView() {
  const [filters, setFilters] = useState<AdminAircraftFilters>(EMPTY_ADMIN_AIRCRAFT_FILTERS);
  const [dialog, setDialog] = useState<DialogState>({ mode: 'closed' });
  const [deleteTarget, setDeleteTarget] = useState<AdminAircraft | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const listQuery = useAdminAircraftQuery(filters);
  const createMutation = useCreateAdminAircraftMutation();
  const updateMutation = useUpdateAdminAircraftMutation();
  const activeMutation = useSetAdminAircraftActiveMutation();
  const deleteMutation = useDeleteAdminAircraftMutation();

  const submitting = createMutation.isPending || updateMutation.isPending;

  if (listQuery.isLoading) {
    return <PageLoader label="Loading aircraft" />;
  }

  if (listQuery.isError) {
    return (
      <ErrorState
        title="Unable to load aircraft"
        message="Please try again in a moment."
        onRetry={() => {
          void listQuery.refetch();
        }}
      />
    );
  }

  const aircraftList = listQuery.data ?? [];

  const handleSubmit = async (values: AircraftFormParsedValues) => {
    setActionError(null);
    const input = toAdminAircraftInput(values);
    try {
      if (dialog.mode === 'create') {
        await createMutation.mutateAsync(input);
      } else if (dialog.mode === 'edit') {
        await updateMutation.mutateAsync({
          aircraftId: dialog.aircraft.id,
          input,
        });
      }
      setDialog({ mode: 'closed' });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to save the aircraft. Please try again.';
      setActionError(message);
    }
  };

  const handleToggleActive = async (aircraft: AdminAircraft) => {
    setActionError(null);
    try {
      await activeMutation.mutateAsync({
        aircraftId: aircraft.id,
        active: !aircraft.active,
      });
    } catch {
      setActionError(`Unable to update status for ${aircraft.registration}.`);
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
      setActionError(`Unable to delete ${deleteTarget.registration}.`);
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
          {aircraftList.length} aircraft
        </Typography>
        <AppButton
          variant="contained"
          onClick={() => {
            setActionError(null);
            setDialog({ mode: 'create' });
          }}
        >
          Create aircraft
        </AppButton>
      </Stack>

      <AircraftFilters value={filters} onChange={setFilters} />

      {actionError ? (
        <AppAlert severity="error" onClose={() => setActionError(null)}>
          {actionError}
        </AppAlert>
      ) : null}

      {aircraftList.length === 0 ? (
        <EmptyState
          title="No aircraft found"
          message="Try clearing filters or create a new aircraft."
          action={
            <AppButton
              variant="contained"
              onClick={() => {
                setActionError(null);
                setDialog({ mode: 'create' });
              }}
            >
              Create aircraft
            </AppButton>
          }
        />
      ) : (
        <AircraftTable
          aircraftList={aircraftList}
          activeUpdatingId={
            activeMutation.isPending ? activeMutation.variables?.aircraftId : null
          }
          onView={(aircraft) => {
            setActionError(null);
            setDialog({ mode: 'view', aircraft });
          }}
          onEdit={(aircraft) => {
            setActionError(null);
            setDialog({ mode: 'edit', aircraft });
          }}
          onDelete={setDeleteTarget}
          onToggleActive={(aircraft) => {
            void handleToggleActive(aircraft);
          }}
        />
      )}

      <AircraftDialog
        open={dialog.mode === 'create' || dialog.mode === 'edit'}
        mode={dialog.mode === 'edit' ? 'edit' : 'create'}
        aircraft={dialog.mode === 'edit' ? dialog.aircraft : null}
        submitting={submitting}
        onClose={() => setDialog({ mode: 'closed' })}
        onSubmit={handleSubmit}
      />

      <AircraftDetailsDialog
        open={dialog.mode === 'view'}
        aircraft={dialog.mode === 'view' ? dialog.aircraft : null}
        onClose={() => setDialog({ mode: 'closed' })}
        onEdit={(aircraft) => {
          setActionError(null);
          setDialog({ mode: 'edit', aircraft });
        }}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete aircraft"
        description={
          deleteTarget
            ? `Delete ${deleteTarget.registration} (${formatAircraftLabel(deleteTarget)})? This cannot be undone.`
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
