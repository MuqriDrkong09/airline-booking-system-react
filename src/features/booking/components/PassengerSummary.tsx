import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { AppBadge } from '@/components/common';
import {
  PASSENGER_TYPE_LABELS,
  type PassengerDraft,
} from '@/features/passengers';
import { passengerDisplayName } from '@/features/seats';
import { SummarySection } from './SummarySection';

export interface PassengerSummaryProps {
  passengers: PassengerDraft[];
  editTo?: string;
}

export function PassengerSummary({ passengers, editTo }: PassengerSummaryProps) {
  return (
    <SummarySection
      title="Passengers"
      subtitle={
        passengers.length === 0
          ? undefined
          : `${passengers.length} passenger${passengers.length === 1 ? '' : 's'}`
      }
      editTo={editTo}
      empty={passengers.length === 0}
      emptyMessage="No passengers saved yet."
    >
      <Stack spacing={1.25}>
        {passengers.map((passenger, index) => {
          const fallback = `${PASSENGER_TYPE_LABELS[passenger.type]} ${index + 1}`;
          const name = passengerDisplayName(
            passenger.firstName,
            passenger.lastName,
            fallback,
          );

          return (
            <Stack
              key={passenger.id}
              direction={{ xs: 'column', sm: 'row' }}
              spacing={0.75}
              sx={{
                justifyContent: 'space-between',
                alignItems: { sm: 'center' },
              }}
            >
              <Stack spacing={0.25} sx={{ minWidth: 0 }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                  <Typography variant="subtitle2" noWrap>
                    {name}
                  </Typography>
                  <AppBadge
                    label={PASSENGER_TYPE_LABELS[passenger.type]}
                    size="small"
                    tone="default"
                  />
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  {[
                    passenger.dateOfBirth ? `DOB ${passenger.dateOfBirth}` : null,
                    passenger.nationality || null,
                    passenger.email || null,
                  ]
                    .filter(Boolean)
                    .join(' · ') || 'Details incomplete'}
                </Typography>
              </Stack>
            </Stack>
          );
        })}
      </Stack>
    </SummarySection>
  );
}
