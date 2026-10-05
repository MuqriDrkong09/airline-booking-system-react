import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';
import { AppBadge, AppButton, AppDialog } from '@/components/common';
import type { AdminAircraft } from '../types/adminAircraft';
import {
  formatAircraftLabel,
  formatSeatBreakdown,
  getActiveLabel,
} from '../utils/formatAdminAircraft';

export interface AircraftDetailsDialogProps {
  open: boolean;
  aircraft: AdminAircraft | null;
  onClose: () => void;
  onEdit?: (aircraft: AdminAircraft) => void;
}

function DetailItem({ label, value }: { label: string; value: ReactNode }) {
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

export function AircraftDetailsDialog({
  open,
  aircraft,
  onClose,
  onEdit,
}: AircraftDetailsDialogProps) {
  const title = aircraft
    ? `${aircraft.registration} · ${formatAircraftLabel(aircraft)}`
    : 'Aircraft details';

  return (
    <AppDialog
      open={open}
      title={title}
      onClose={onClose}
      maxWidth="md"
      actions={
        <>
          <AppButton onClick={onClose} color="inherit">
            Close
          </AppButton>
          {aircraft && onEdit ? (
            <AppButton
              variant="contained"
              onClick={() => {
                onEdit(aircraft);
              }}
            >
              Edit aircraft
            </AppButton>
          ) : null}
        </>
      }
    >
      {aircraft ? (
        <Stack spacing={3}>
          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
            }}
          >
            <DetailItem label="Manufacturer" value={aircraft.manufacturer} />
            <DetailItem label="Model" value={aircraft.model} />
            <DetailItem label="Registration" value={aircraft.registration} />
            <DetailItem
              label="Status"
              value={
                <AppBadge
                  label={getActiveLabel(aircraft.active)}
                  tone={aircraft.active ? 'success' : 'default'}
                />
              }
            />
            <DetailItem label="Total seats" value={aircraft.totalSeats} />
            <DetailItem label="Cabin breakdown" value={formatSeatBreakdown(aircraft)} />
            <DetailItem label="Economy" value={aircraft.economySeats} />
            <DetailItem label="Premium economy" value={aircraft.premiumEconomySeats} />
            <DetailItem label="Business" value={aircraft.businessSeats} />
            <DetailItem label="First class" value={aircraft.firstClassSeats} />
          </Box>

          <Stack spacing={1.5}>
            <Typography variant="subtitle2">Seat-map configuration</Typography>
            {aircraft.seatMapConfig ? (
              <Stack spacing={1.5}>
                <DetailItem label="Layout key" value={aircraft.seatMapConfig.layoutKey} />
                <DetailItem label="Version" value={aircraft.seatMapConfig.version} />
                {aircraft.seatMapConfig.notes ? (
                  <DetailItem label="Notes" value={aircraft.seatMapConfig.notes} />
                ) : null}
                <Box
                  component="ul"
                  sx={{ m: 0, pl: 2.5, display: 'grid', gap: 0.75 }}
                  aria-label="Seat-map cabins"
                >
                  {aircraft.seatMapConfig.cabins.map((cabin) => (
                    <Typography key={cabin.cabinClass} component="li" variant="body2">
                      {cabin.cabinClass}: {cabin.seatCount} seats · rows {cabin.startRow}–
                      {cabin.startRow + cabin.rowCount - 1} · columns{' '}
                      {cabin.columns.join('')}
                    </Typography>
                  ))}
                </Box>
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No seat-map configuration has been prepared for this aircraft yet.
              </Typography>
            )}
          </Stack>
        </Stack>
      ) : null}
    </AppDialog>
  );
}
