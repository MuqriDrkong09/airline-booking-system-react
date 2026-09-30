import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { AppBadge, AppCard } from '@/components/common';
import type { AppBadgeTone } from '@/components/common/AppBadge';
import type { FlightOperationalStatus, FlightStatusRecord } from '../../types/flightStatus';
import { FLIGHT_OPERATIONAL_STATUS_LABELS } from '../../types/flightStatus';
import { formatFlightDate, formatFlightTime } from '../../utils/flightResults';

export interface FlightStatusResultProps {
  status: FlightStatusRecord;
}

const STATUS_TONE: Record<FlightOperationalStatus, AppBadgeTone> = {
  SCHEDULED: 'info',
  BOARDING: 'primary',
  DELAYED: 'warning',
  DEPARTED: 'secondary',
  ARRIVED: 'success',
  CANCELLED: 'error',
};

function Field({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          display: 'block',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}
      >
        {label}
      </Typography>
      <Typography variant="body1" sx={{ fontWeight: 600, wordBreak: 'break-word' }}>
        {value}
      </Typography>
    </Box>
  );
}

function formatDateTime(isoLocal: string): string {
  return `${formatFlightDate(isoLocal)} · ${formatFlightTime(isoLocal)}`;
}

export function FlightStatusResult({ status }: FlightStatusResultProps) {
  const route = `${status.origin.code} → ${status.destination.code}`;

  return (
    <AppCard
      title={status.flightNumber}
      subtitle={`${status.airline.name} · ${route}`}
      action={
        <AppBadge
          label={FLIGHT_OPERATIONAL_STATUS_LABELS[status.status]}
          tone={STATUS_TONE[status.status]}
        />
      }
    >
      <Stack spacing={2.25}>
        <Box
          sx={{
            display: 'grid',
            gap: 1.75,
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, minmax(0, 1fr))',
            },
          }}
        >
          <Field label="Flight number" value={status.flightNumber} />
          <Field label="Airline" value={status.airline.name} />
          <Field
            label="Route"
            value={`${status.origin.code} (${status.origin.city}) → ${status.destination.code} (${status.destination.city})`}
          />
          <Field label="Status" value={FLIGHT_OPERATIONAL_STATUS_LABELS[status.status]} />
        </Box>

        <Divider />

        <Box
          sx={{
            display: 'grid',
            gap: 1.75,
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, minmax(0, 1fr))',
            },
          }}
        >
          <Field label="Scheduled departure" value={formatDateTime(status.scheduledDeparture)} />
          <Field label="Estimated departure" value={formatDateTime(status.estimatedDeparture)} />
          <Field label="Scheduled arrival" value={formatDateTime(status.scheduledArrival)} />
          <Field label="Estimated arrival" value={formatDateTime(status.estimatedArrival)} />
          <Field label="Terminal" value={status.terminal} />
          <Field label="Gate" value={status.gate} />
        </Box>
      </Stack>
    </AppCard>
  );
}
