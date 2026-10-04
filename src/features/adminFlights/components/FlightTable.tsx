import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { Pencil, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';
import type { FlightOperationalStatus } from '@/features/flights';
import {
  AppBadge,
  AppCard,
  AppSelect,
  AppTable,
  type AppTableColumn,
} from '@/components/common';
import { STATUS_OPTIONS } from '../constants/options';
import type { AdminFlight } from '../types/adminFlight';
import {
  formatFareClasses,
  formatFlightDateTime,
  getAirlineLabel,
  getStatusTone,
} from '../utils/formatAdminFlight';

export interface FlightTableProps {
  flights: readonly AdminFlight[];
  statusUpdatingId?: string | null;
  onEdit: (flight: AdminFlight) => void;
  onDelete: (flight: AdminFlight) => void;
  onStatusChange: (flight: AdminFlight, status: FlightOperationalStatus) => void;
}

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gap: 0.5,
        gridTemplateColumns: '1fr',
      }}
    >
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" component="div" sx={{ wordBreak: 'break-word' }}>
        {value}
      </Typography>
    </Box>
  );
}

function FlightMobileCard({
  flight,
  statusUpdatingId,
  onEdit,
  onDelete,
  onStatusChange,
}: {
  flight: AdminFlight;
  statusUpdatingId?: string | null;
  onEdit: (flight: AdminFlight) => void;
  onDelete: (flight: AdminFlight) => void;
  onStatusChange: (flight: AdminFlight, status: FlightOperationalStatus) => void;
}) {
  return (
    <AppCard
      title={flight.flightNumber}
      subtitle={getAirlineLabel(flight.airline)}
      action={
        <Stack direction="row" spacing={0.5}>
          <IconButton
            aria-label={`Edit ${flight.flightNumber}`}
            size="small"
            onClick={() => onEdit(flight)}
          >
            <Pencil aria-hidden="true" size={16} />
          </IconButton>
          <IconButton
            aria-label={`Delete ${flight.flightNumber}`}
            size="small"
            color="error"
            onClick={() => onDelete(flight)}
          >
            <Trash2 aria-hidden="true" size={16} />
          </IconButton>
        </Stack>
      }
    >
      <Stack spacing={1.5}>
        <InfoRow label="Route" value={`${flight.origin} → ${flight.destination}`} />
        <InfoRow label="Aircraft" value={flight.aircraft} />
        <InfoRow label="Departure" value={formatFlightDateTime(flight.departure)} />
        <InfoRow label="Arrival" value={formatFlightDateTime(flight.arrival)} />
        <InfoRow label="Terminal" value={flight.terminal} />
        <InfoRow label="Gate" value={flight.gate} />
        <InfoRow label="Available seats" value={flight.availableSeats} />
        <InfoRow label="Fare classes" value={formatFareClasses(flight.fareClasses)} />
        <InfoRow
          label="Status"
          value={
            <Stack spacing={1}>
              <Box>
                <AppBadge
                  label={
                    STATUS_OPTIONS.find((option) => option.value === flight.status)?.label
                  }
                  tone={getStatusTone(flight.status)}
                />
              </Box>
              <AppSelect
                label="Update status"
                hideLabel
                size="small"
                options={STATUS_OPTIONS}
                value={flight.status}
                disabled={statusUpdatingId === flight.id}
                onChange={(status) =>
                  onStatusChange(flight, status as FlightOperationalStatus)
                }
              />
            </Stack>
          }
        />
      </Stack>
    </AppCard>
  );
}

export function FlightTable({
  flights,
  statusUpdatingId = null,
  onEdit,
  onDelete,
  onStatusChange,
}: FlightTableProps) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'), { defaultMatches: true });

  const columns: AppTableColumn<AdminFlight>[] = [
    {
      id: 'flight',
      header: 'Flight',
      cell: (flight) => (
        <Stack spacing={0.25}>
          <strong>{flight.flightNumber}</strong>
          <span>{getAirlineLabel(flight.airline)}</span>
        </Stack>
      ),
    },
    {
      id: 'route',
      header: 'Route',
      cell: (flight) => `${flight.origin} → ${flight.destination}`,
    },
    {
      id: 'aircraft',
      header: 'Aircraft',
      cell: (flight) => flight.aircraft,
    },
    {
      id: 'schedule',
      header: 'Schedule',
      cell: (flight) => (
        <Stack spacing={0.25}>
          <span>{formatFlightDateTime(flight.departure)}</span>
          <span>{formatFlightDateTime(flight.arrival)}</span>
        </Stack>
      ),
    },
    {
      id: 'terminalGate',
      header: 'Terminal / Gate',
      cell: (flight) => `${flight.terminal} / ${flight.gate}`,
    },
    {
      id: 'seats',
      header: 'Seats',
      align: 'right',
      cell: (flight) => flight.availableSeats,
    },
    {
      id: 'fareClasses',
      header: 'Fare classes',
      cell: (flight) => formatFareClasses(flight.fareClasses),
    },
    {
      id: 'status',
      header: 'Status',
      cell: (flight) => (
        <Stack spacing={1} sx={{ minWidth: 150 }}>
          <AppBadge
            label={STATUS_OPTIONS.find((option) => option.value === flight.status)?.label}
            tone={getStatusTone(flight.status)}
          />
          <AppSelect
            label="Update status"
            hideLabel
            size="small"
            options={STATUS_OPTIONS}
            value={flight.status}
            disabled={statusUpdatingId === flight.id}
            onChange={(status) =>
              onStatusChange(flight, status as FlightOperationalStatus)
            }
          />
        </Stack>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      align: 'right',
      cell: (flight) => (
        <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'flex-end' }}>
          <IconButton
            aria-label={`Edit ${flight.flightNumber}`}
            size="small"
            onClick={() => onEdit(flight)}
          >
            <Pencil aria-hidden="true" size={16} />
          </IconButton>
          <IconButton
            aria-label={`Delete ${flight.flightNumber}`}
            size="small"
            color="error"
            onClick={() => onDelete(flight)}
          >
            <Trash2 aria-hidden="true" size={16} />
          </IconButton>
        </Stack>
      ),
    },
  ];

  if (flights.length === 0) {
    return (
      <Box role="status" sx={{ py: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">No flights match your filters.</Typography>
      </Box>
    );
  }

  if (!isDesktop) {
    return (
      <Stack spacing={2} component="section" aria-label="Admin flights">
        {flights.map((flight) => (
          <FlightMobileCard
            key={flight.id}
            flight={flight}
            statusUpdatingId={statusUpdatingId}
            onEdit={onEdit}
            onDelete={onDelete}
            onStatusChange={onStatusChange}
          />
        ))}
      </Stack>
    );
  }

  return (
    <AppTable
      ariaLabel="Admin flights"
      columns={columns}
      rows={flights}
      getRowId={(flight) => flight.id}
      emptyMessage="No flights match your filters."
      dense
      stickyHeader
    />
  );
}
