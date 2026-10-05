import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { Armchair, Eye, Pencil, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';
import {
  AppBadge,
  AppButton,
  AppCard,
  AppTable,
  type AppTableColumn,
} from '@/components/common';
import type { AdminAircraft } from '../types/adminAircraft';
import {
  formatAircraftLabel,
  formatSeatBreakdown,
  getActiveLabel,
} from '../utils/formatAdminAircraft';

export interface AircraftTableProps {
  aircraftList: readonly AdminAircraft[];
  activeUpdatingId?: string | null;
  onView: (aircraft: AdminAircraft) => void;
  onEdit: (aircraft: AdminAircraft) => void;
  onConfigureSeats: (aircraft: AdminAircraft) => void;
  onDelete: (aircraft: AdminAircraft) => void;
  onToggleActive: (aircraft: AdminAircraft) => void;
}

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <Box sx={{ display: 'grid', gap: 0.5, gridTemplateColumns: '1fr' }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" component="div" sx={{ wordBreak: 'break-word' }}>
        {value}
      </Typography>
    </Box>
  );
}

function AircraftMobileCard({
  aircraft,
  activeUpdatingId,
  onView,
  onEdit,
  onConfigureSeats,
  onDelete,
  onToggleActive,
}: {
  aircraft: AdminAircraft;
  activeUpdatingId?: string | null;
  onView: (aircraft: AdminAircraft) => void;
  onEdit: (aircraft: AdminAircraft) => void;
  onConfigureSeats: (aircraft: AdminAircraft) => void;
  onDelete: (aircraft: AdminAircraft) => void;
  onToggleActive: (aircraft: AdminAircraft) => void;
}) {
  return (
    <AppCard
      title={aircraft.registration}
      subtitle={formatAircraftLabel(aircraft)}
      action={
        <Stack direction="row" spacing={0.5}>
          <IconButton
            aria-label={`View ${aircraft.registration}`}
            size="small"
            onClick={() => onView(aircraft)}
          >
            <Eye aria-hidden="true" size={16} />
          </IconButton>
          <IconButton
            aria-label={`Configure seats ${aircraft.registration}`}
            size="small"
            onClick={() => onConfigureSeats(aircraft)}
          >
            <Armchair aria-hidden="true" size={16} />
          </IconButton>
          <IconButton
            aria-label={`Edit ${aircraft.registration}`}
            size="small"
            onClick={() => onEdit(aircraft)}
          >
            <Pencil aria-hidden="true" size={16} />
          </IconButton>
          <IconButton
            aria-label={`Delete ${aircraft.registration}`}
            size="small"
            color="error"
            onClick={() => onDelete(aircraft)}
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
        <InfoRow label="Manufacturer" value={aircraft.manufacturer} />
        <InfoRow label="Model" value={aircraft.model} />
        <InfoRow label="Total seats" value={aircraft.totalSeats} />
        <InfoRow label="Cabins" value={formatSeatBreakdown(aircraft)} />
        <InfoRow
          label="Status"
          value={
            <AppBadge
              label={getActiveLabel(aircraft.active)}
              tone={aircraft.active ? 'success' : 'default'}
            />
          }
        />
        <Box sx={{ gridColumn: '1 / -1' }}>
          <AppButton
            size="small"
            variant="outlined"
            fullWidth
            disabled={activeUpdatingId === aircraft.id}
            onClick={() => onToggleActive(aircraft)}
          >
            {aircraft.active ? 'Deactivate' : 'Activate'}
          </AppButton>
        </Box>
      </Box>
    </AppCard>
  );
}

export function AircraftTable({
  aircraftList,
  activeUpdatingId = null,
  onView,
  onEdit,
  onConfigureSeats,
  onDelete,
  onToggleActive,
}: AircraftTableProps) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'), { defaultMatches: true });

  const columns: AppTableColumn<AdminAircraft>[] = [
    {
      id: 'registration',
      header: 'Registration',
      cell: (aircraft) => <strong>{aircraft.registration}</strong>,
    },
    {
      id: 'manufacturer',
      header: 'Manufacturer',
      cell: (aircraft) => aircraft.manufacturer,
    },
    {
      id: 'model',
      header: 'Model',
      cell: (aircraft) => aircraft.model,
    },
    {
      id: 'totalSeats',
      header: 'Seats',
      align: 'right',
      cell: (aircraft) => aircraft.totalSeats,
    },
    {
      id: 'cabins',
      header: 'Cabins',
      cell: (aircraft) => formatSeatBreakdown(aircraft),
    },
    {
      id: 'active',
      header: 'Status',
      cell: (aircraft) => (
        <Stack spacing={1} sx={{ minWidth: 140 }}>
          <AppBadge
            label={getActiveLabel(aircraft.active)}
            tone={aircraft.active ? 'success' : 'default'}
          />
          <AppButton
            size="small"
            variant="outlined"
            disabled={activeUpdatingId === aircraft.id}
            onClick={() => onToggleActive(aircraft)}
          >
            {aircraft.active ? 'Deactivate' : 'Activate'}
          </AppButton>
        </Stack>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      align: 'right',
      cell: (aircraft) => (
        <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'flex-end' }}>
          <IconButton
            aria-label={`View ${aircraft.registration}`}
            size="small"
            onClick={() => onView(aircraft)}
          >
            <Eye aria-hidden="true" size={16} />
          </IconButton>
          <IconButton
            aria-label={`Configure seats ${aircraft.registration}`}
            size="small"
            onClick={() => onConfigureSeats(aircraft)}
          >
            <Armchair aria-hidden="true" size={16} />
          </IconButton>
          <IconButton
            aria-label={`Edit ${aircraft.registration}`}
            size="small"
            onClick={() => onEdit(aircraft)}
          >
            <Pencil aria-hidden="true" size={16} />
          </IconButton>
          <IconButton
            aria-label={`Delete ${aircraft.registration}`}
            size="small"
            color="error"
            onClick={() => onDelete(aircraft)}
          >
            <Trash2 aria-hidden="true" size={16} />
          </IconButton>
        </Stack>
      ),
    },
  ];

  if (aircraftList.length === 0) {
    return (
      <Box role="status" sx={{ py: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">No aircraft match your filters.</Typography>
      </Box>
    );
  }

  if (!isDesktop) {
    return (
      <Stack spacing={2} component="section" aria-label="Admin aircraft">
        {aircraftList.map((aircraft) => (
          <AircraftMobileCard
            key={aircraft.id}
            aircraft={aircraft}
            activeUpdatingId={activeUpdatingId}
            onView={onView}
            onEdit={onEdit}
            onConfigureSeats={onConfigureSeats}
            onDelete={onDelete}
            onToggleActive={onToggleActive}
          />
        ))}
      </Stack>
    );
  }

  return (
    <AppTable
      ariaLabel="Admin aircraft"
      columns={columns}
      rows={aircraftList}
      getRowId={(aircraft) => aircraft.id}
      emptyMessage="No aircraft match your filters."
      dense
      stickyHeader
    />
  );
}
