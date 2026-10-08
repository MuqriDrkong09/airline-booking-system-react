import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import {
  AppAlert,
  AppButton,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  TableSkeleton,
} from '@/components/common';
import {
  useAdminPromoCodesQuery,
  useCreateAdminPromoCodeMutation,
  useDeleteAdminPromoCodeMutation,
  useSetAdminPromoCodeActiveMutation,
  useUpdateAdminPromoCodeMutation,
} from '../hooks/useAdminPromoCodes';
import type { PromoCodeFormParsedValues } from '../schemas/promoCodeFormSchema';
import {
  EMPTY_ADMIN_PROMO_CODE_FILTERS,
  type AdminPromoCode,
  type AdminPromoCodeFilters,
} from '../types/adminPromoCode';
import { toAdminPromoCodeInput } from '../utils/formatAdminPromoCode';
import { PromoCodeDialog } from './PromoCodeDialog';
import { PromoCodeFilters } from './PromoCodeFilters';
import { PromoCodeTable } from './PromoCodeTable';

export function AdminPromoCodesView() {
  const [filters, setFilters] = useState<AdminPromoCodeFilters>(EMPTY_ADMIN_PROMO_CODE_FILTERS);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [editingPromo, setEditingPromo] = useState<AdminPromoCode | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminPromoCode | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const listQuery = useAdminPromoCodesQuery(filters);
  const createMutation = useCreateAdminPromoCodeMutation();
  const updateMutation = useUpdateAdminPromoCodeMutation();
  const activeMutation = useSetAdminPromoCodeActiveMutation();
  const deleteMutation = useDeleteAdminPromoCodeMutation();

  const submitting = createMutation.isPending || updateMutation.isPending;

  if (listQuery.isPending && !listQuery.data) {
    return (
      <Stack spacing={3}>
        <Skeleton width={160} />
        <PromoCodeFilters value={filters} onChange={setFilters} />
        <TableSkeleton columnCount={6} rowCount={6} showToolbar={false} />
      </Stack>
    );
  }

  if (listQuery.isError) {
    return (
      <ErrorState
        title="Unable to load promo codes"
        message="Please try again in a moment."
        onRetry={() => {
          void listQuery.refetch();
        }}
      />
    );
  }

  const promoCodes = listQuery.data ?? [];

  const openCreateDialog = () => {
    setActionError(null);
    setDialogMode('create');
    setEditingPromo(null);
    setDialogOpen(true);
  };

  const openEditDialog = (promo: AdminPromoCode) => {
    setActionError(null);
    setDialogMode('edit');
    setEditingPromo(promo);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
  };

  const handleSubmit = async (values: PromoCodeFormParsedValues) => {
    if (!dialogOpen) {
      return;
    }

    setActionError(null);
    const input = toAdminPromoCodeInput(values);
    try {
      if (dialogMode === 'create') {
        await createMutation.mutateAsync(input);
      } else if (editingPromo) {
        await updateMutation.mutateAsync({
          promoId: editingPromo.id,
          input,
        });
      }
      closeDialog();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unable to save the promo code. Please try again.';
      setActionError(message);
    }
  };

  const handleToggleActive = async (promo: AdminPromoCode) => {
    setActionError(null);
    try {
      await activeMutation.mutateAsync({
        promoId: promo.id,
        active: !promo.active,
      });
    } catch {
      setActionError(`Unable to update status for ${promo.code}.`);
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
          {promoCodes.length} promo code{promoCodes.length === 1 ? '' : 's'}
        </Typography>
        <AppButton variant="contained" onClick={openCreateDialog}>
          Create promo code
        </AppButton>
      </Stack>

      <PromoCodeFilters value={filters} onChange={setFilters} />

      {actionError ? (
        <AppAlert severity="error" onClose={() => setActionError(null)}>
          {actionError}
        </AppAlert>
      ) : null}

      {promoCodes.length === 0 ? (
        <EmptyState
          title="No promo codes found"
          message="Try clearing filters or create a new promo code."
          action={
            <AppButton variant="contained" onClick={openCreateDialog}>
              Create promo code
            </AppButton>
          }
        />
      ) : (
        <PromoCodeTable
          promoCodes={promoCodes}
          activeUpdatingId={
            activeMutation.isPending ? activeMutation.variables?.promoId : null
          }
          onEdit={openEditDialog}
          onDelete={setDeleteTarget}
          onToggleActive={(promo) => {
            void handleToggleActive(promo);
          }}
        />
      )}

      <PromoCodeDialog
        open={dialogOpen}
        mode={dialogMode}
        promoCode={editingPromo}
        submitting={submitting}
        onClose={closeDialog}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete promo code"
        description={
          deleteTarget
            ? `Delete ${deleteTarget.code}? This cannot be undone.`
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
