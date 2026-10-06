import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { Pencil, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';
import {
  AppBadge,
  AppButton,
  AppCard,
  AppTable,
  type AppTableColumn,
} from '@/components/common';
import type { AdminPromoCode } from '../types/adminPromoCode';
import {
  formatDiscountValue,
  formatUsage,
  getActiveLabel,
  getDiscountTypeLabel,
} from '../utils/formatAdminPromoCode';

export interface PromoCodeTableProps {
  promoCodes: readonly AdminPromoCode[];
  activeUpdatingId?: string | null;
  onEdit: (promo: AdminPromoCode) => void;
  onDelete: (promo: AdminPromoCode) => void;
  onToggleActive: (promo: AdminPromoCode) => void;
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

function PromoMobileCard({
  promo,
  activeUpdatingId,
  onEdit,
  onDelete,
  onToggleActive,
}: {
  promo: AdminPromoCode;
  activeUpdatingId?: string | null;
  onEdit: (promo: AdminPromoCode) => void;
  onDelete: (promo: AdminPromoCode) => void;
  onToggleActive: (promo: AdminPromoCode) => void;
}) {
  return (
    <AppCard
      title={promo.code}
      subtitle={promo.description}
      action={
        <Stack direction="row" spacing={0.5}>
          <IconButton
            aria-label={`Edit ${promo.code}`}
            size="small"
            onClick={() => onEdit(promo)}
          >
            <Pencil aria-hidden="true" size={16} />
          </IconButton>
          <IconButton
            aria-label={`Delete ${promo.code}`}
            size="small"
            color="error"
            onClick={() => onDelete(promo)}
          >
            <Trash2 aria-hidden="true" size={16} />
          </IconButton>
        </Stack>
      }
    >
      <Box
        sx={{
          display: 'grid',
          gap: 1.5,
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        }}
      >
        <InfoRow label="Type" value={getDiscountTypeLabel(promo.discountType)} />
        <InfoRow label="Discount" value={formatDiscountValue(promo)} />
        <InfoRow label="Valid" value={`${promo.startDate} → ${promo.endDate}`} />
        <InfoRow label="Usage" value={formatUsage(promo)} />
        <InfoRow
          label="Status"
          value={
            <AppBadge
              label={getActiveLabel(promo.active)}
              tone={promo.active ? 'success' : 'default'}
            />
          }
        />
        <Box sx={{ gridColumn: '1 / -1' }}>
          <AppButton
            size="small"
            variant="outlined"
            fullWidth
            disabled={activeUpdatingId === promo.id}
            onClick={() => onToggleActive(promo)}
          >
            {promo.active ? 'Deactivate' : 'Activate'}
          </AppButton>
        </Box>
      </Box>
    </AppCard>
  );
}

export function PromoCodeTable({
  promoCodes,
  activeUpdatingId = null,
  onEdit,
  onDelete,
  onToggleActive,
}: PromoCodeTableProps) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'), { defaultMatches: true });

  const columns: AppTableColumn<AdminPromoCode>[] = [
    {
      id: 'code',
      header: 'Code',
      cell: (promo) => <strong>{promo.code}</strong>,
    },
    {
      id: 'description',
      header: 'Description',
      cell: (promo) => promo.description,
    },
    {
      id: 'discountType',
      header: 'Type',
      cell: (promo) => getDiscountTypeLabel(promo.discountType),
    },
    {
      id: 'discountValue',
      header: 'Discount',
      cell: (promo) => formatDiscountValue(promo),
    },
    {
      id: 'dates',
      header: 'Valid',
      cell: (promo) => `${promo.startDate} → ${promo.endDate}`,
    },
    {
      id: 'usage',
      header: 'Usage',
      cell: (promo) => formatUsage(promo),
    },
    {
      id: 'active',
      header: 'Status',
      cell: (promo) => (
        <Stack spacing={1} sx={{ minWidth: 140 }}>
          <AppBadge
            label={getActiveLabel(promo.active)}
            tone={promo.active ? 'success' : 'default'}
          />
          <AppButton
            size="small"
            variant="outlined"
            disabled={activeUpdatingId === promo.id}
            onClick={() => onToggleActive(promo)}
          >
            {promo.active ? 'Deactivate' : 'Activate'}
          </AppButton>
        </Stack>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      align: 'right',
      cell: (promo) => (
        <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'flex-end' }}>
          <IconButton
            aria-label={`Edit ${promo.code}`}
            size="small"
            onClick={() => onEdit(promo)}
          >
            <Pencil aria-hidden="true" size={16} />
          </IconButton>
          <IconButton
            aria-label={`Delete ${promo.code}`}
            size="small"
            color="error"
            onClick={() => onDelete(promo)}
          >
            <Trash2 aria-hidden="true" size={16} />
          </IconButton>
        </Stack>
      ),
    },
  ];

  if (promoCodes.length === 0) {
    return (
      <Box role="status" sx={{ py: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">No promo codes match your filters.</Typography>
      </Box>
    );
  }

  if (!isDesktop) {
    return (
      <Stack spacing={2} component="section" aria-label="Admin promo codes">
        {promoCodes.map((promo) => (
          <PromoMobileCard
            key={promo.id}
            promo={promo}
            activeUpdatingId={activeUpdatingId}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleActive={onToggleActive}
          />
        ))}
      </Stack>
    );
  }

  return (
    <AppTable
      ariaLabel="Admin promo codes"
      columns={columns}
      rows={promoCodes}
      getRowId={(promo) => promo.id}
      emptyMessage="No promo codes match your filters."
      dense
      stickyHeader
    />
  );
}
