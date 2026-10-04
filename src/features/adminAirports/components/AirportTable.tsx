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
import type { AdminAirport } from '../types/adminAirport';
import {
  formatCoordinates,
  getActiveLabel,
} from '../utils/formatAdminAirport';

export interface AirportTableProps {
  airports: readonly AdminAirport[];
  activeUpdatingId?: string | null;
  onEdit: (airport: AdminAirport) => void;
  onDelete: (airport: AdminAirport) => void;
  onToggleActive: (airport: AdminAirport) => void;
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

function AirportMobileCard({
  airport,
  activeUpdatingId,
  onEdit,
  onDelete,
  onToggleActive,
}: {
  airport: AdminAirport;
  activeUpdatingId?: string | null;
  onEdit: (airport: AdminAirport) => void;
  onDelete: (airport: AdminAirport) => void;
  onToggleActive: (airport: AdminAirport) => void;
}) {
  return (
    <AppCard
      title={airport.code}
      subtitle={airport.name}
      action={
        <Stack direction="row" spacing={0.5}>
          <IconButton
            aria-label={`Edit ${airport.code}`}
            size="small"
            onClick={() => onEdit(airport)}
          >
            <Pencil aria-hidden="true" size={16} />
          </IconButton>
          <IconButton
            aria-label={`Delete ${airport.code}`}
            size="small"
            color="error"
            onClick={() => onDelete(airport)}
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
        <InfoRow label="City" value={airport.city} />
        <InfoRow label="Country" value={airport.country} />
        <InfoRow label="Timezone" value={airport.timezone} />
        <InfoRow label="Terminals" value={airport.terminalCount} />
        <InfoRow
          label="Coordinates"
          value={formatCoordinates(airport.latitude, airport.longitude)}
        />
        <InfoRow
          label="Status"
          value={
            <AppBadge
              label={getActiveLabel(airport.active)}
              tone={airport.active ? 'success' : 'default'}
            />
          }
        />
        <Box sx={{ gridColumn: '1 / -1' }}>
          <AppButton
            size="small"
            variant="outlined"
            fullWidth
            disabled={activeUpdatingId === airport.id}
            onClick={() => onToggleActive(airport)}
          >
            {airport.active ? 'Deactivate' : 'Activate'}
          </AppButton>
        </Box>
      </Box>
    </AppCard>
  );
}

export function AirportTable({
  airports,
  activeUpdatingId = null,
  onEdit,
  onDelete,
  onToggleActive,
}: AirportTableProps) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'), { defaultMatches: true });

  const columns: AppTableColumn<AdminAirport>[] = [
    {
      id: 'code',
      header: 'Code',
      cell: (airport) => <strong>{airport.code}</strong>,
    },
    {
      id: 'name',
      header: 'Name',
      cell: (airport) => airport.name,
    },
    {
      id: 'city',
      header: 'City',
      cell: (airport) => airport.city,
    },
    {
      id: 'country',
      header: 'Country',
      cell: (airport) => airport.country,
    },
    {
      id: 'timezone',
      header: 'Timezone',
      cell: (airport) => airport.timezone,
    },
    {
      id: 'terminals',
      header: 'Terminals',
      align: 'right',
      cell: (airport) => airport.terminalCount,
    },
    {
      id: 'coordinates',
      header: 'Coordinates',
      cell: (airport) => formatCoordinates(airport.latitude, airport.longitude),
    },
    {
      id: 'active',
      header: 'Status',
      cell: (airport) => (
        <Stack spacing={1} sx={{ minWidth: 140 }}>
          <AppBadge
            label={getActiveLabel(airport.active)}
            tone={airport.active ? 'success' : 'default'}
          />
          <AppButton
            size="small"
            variant="outlined"
            disabled={activeUpdatingId === airport.id}
            onClick={() => onToggleActive(airport)}
          >
            {airport.active ? 'Deactivate' : 'Activate'}
          </AppButton>
        </Stack>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      align: 'right',
      cell: (airport) => (
        <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'flex-end' }}>
          <IconButton
            aria-label={`Edit ${airport.code}`}
            size="small"
            onClick={() => onEdit(airport)}
          >
            <Pencil aria-hidden="true" size={16} />
          </IconButton>
          <IconButton
            aria-label={`Delete ${airport.code}`}
            size="small"
            color="error"
            onClick={() => onDelete(airport)}
          >
            <Trash2 aria-hidden="true" size={16} />
          </IconButton>
        </Stack>
      ),
    },
  ];

  if (airports.length === 0) {
    return (
      <Box role="status" sx={{ py: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">No airports match your filters.</Typography>
      </Box>
    );
  }

  if (!isDesktop) {
    return (
      <Stack spacing={2} component="section" aria-label="Admin airports">
        {airports.map((airport) => (
          <AirportMobileCard
            key={airport.id}
            airport={airport}
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
      ariaLabel="Admin airports"
      columns={columns}
      rows={airports}
      getRowId={(airport) => airport.id}
      emptyMessage="No airports match your filters."
      dense
      stickyHeader
    />
  );
}
