import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { formatBaggageWeight } from '@/features/baggage';
import type { PassengerBaggageSelection } from '@/features/baggage';
import { PASSENGER_TYPE_LABELS, type PassengerDraft } from '@/features/passengers';
import { passengerDisplayName } from '@/features/seats';
import { formatBookingMoney } from '../utils/formatMoney';
import { SummarySection } from './SummarySection';

export interface BaggageSummaryProps {
  baggage: PassengerBaggageSelection[];
  passengers: PassengerDraft[];
  baggageTotal: number;
  currency?: string;
  editTo?: string;
}

export function BaggageSummary({
  baggage,
  passengers,
  baggageTotal,
  currency = 'USD',
  editTo,
}: BaggageSummaryProps) {
  const nameById = new Map(
    passengers.map((passenger, index) => [
      passenger.id,
      passengerDisplayName(
        passenger.firstName,
        passenger.lastName,
        `${PASSENGER_TYPE_LABELS[passenger.type]} ${index + 1}`,
      ),
    ]),
  );

  return (
    <SummarySection
      title="Baggage"
      editTo={editTo}
      empty={baggage.length === 0}
      emptyMessage="No baggage selections yet."
    >
      <Stack spacing={1.25}>
        {baggage.map((selection) => (
          <Stack key={selection.passengerId} spacing={0.25}>
            <Typography variant="subtitle2">
              {nameById.get(selection.passengerId) ?? selection.passengerId}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Cabin {formatBaggageWeight(selection.cabinKg)}
              {selection.checkedKg > 0
                ? ` · Checked ${formatBaggageWeight(selection.checkedKg)}`
                : ' · No checked bag'}
              {selection.additionalKg > 0
                ? ` · Extra ${formatBaggageWeight(selection.additionalKg)}`
                : ''}
            </Typography>
          </Stack>
        ))}
        <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
          <Typography variant="body2" color="text.secondary">
            Baggage total
          </Typography>
          <Typography variant="subtitle2">
            {formatBookingMoney(baggageTotal, currency)}
          </Typography>
        </Stack>
      </Stack>
    </SummarySection>
  );
}
