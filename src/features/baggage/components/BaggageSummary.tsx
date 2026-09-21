import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { AppBadge, AppCard } from '@/components/common';
import { formatBaggageWeight, type BaggageAllowance } from '../constants/baggage';
import type { BaggagePassenger, PassengerBaggageSelection } from '../types/baggage';
import { calculateBaggageTotal, pricePassengerBaggage } from '../utils/baggageRules';

export interface BaggageSummaryProps {
  allowance: BaggageAllowance;
  passengers: BaggagePassenger[];
  selections: PassengerBaggageSelection[];
}

export function BaggageSummary({ allowance, passengers, selections }: BaggageSummaryProps) {
  const total = calculateBaggageTotal(selections, passengers, allowance);
  const byId = new Map(selections.map((selection) => [selection.passengerId, selection]));

  return (
    <AppCard title="Baggage summary" subtitle="Included allowance and extra fees for this booking.">
      <Stack spacing={1.5}>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
          <AppBadge label={`Cabin allowance ${formatBaggageWeight(allowance.cabinKg)}`} tone="info" />
          <AppBadge
            label={
              allowance.checkedKg > 0
                ? `Checked allowance ${formatBaggageWeight(allowance.checkedKg)}`
                : 'No checked allowance'
            }
            tone="default"
          />
        </Stack>

        {passengers.map((passenger) => {
          const selection = byId.get(passenger.id);
          if (!selection) {
            return null;
          }
          const line = pricePassengerBaggage(selection, allowance, passenger.type);
          return (
            <Stack key={passenger.id} spacing={0.25}>
              <Typography variant="subtitle2">{passenger.displayName}</Typography>
              <Typography variant="body2" color="text.secondary">
                Cabin {formatBaggageWeight(selection.cabinKg)}
                {selection.checkedKg > 0
                  ? ` · Checked ${formatBaggageWeight(selection.checkedKg)}`
                  : ' · No checked bag'}
                {selection.additionalKg > 0
                  ? ` · Extra ${formatBaggageWeight(selection.additionalKg)}`
                  : ''}
                {' · '}
                ${line.total}
              </Typography>
            </Stack>
          );
        })}

        <Divider />
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Baggage total
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            ${total}
          </Typography>
        </Stack>
      </Stack>
    </AppCard>
  );
}
