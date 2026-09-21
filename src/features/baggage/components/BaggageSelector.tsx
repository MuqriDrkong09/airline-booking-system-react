import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { AppCard } from '@/components/common';
import {
  BAGGAGE_TYPE_LABELS,
  BAGGAGE_WEIGHT_PRICE_USD,
  BAGGAGE_WEIGHTS_KG,
  formatBaggageWeight,
  type BaggageAllowance,
  type BaggageWeightKg,
} from '../constants/baggage';
import type { BaggagePassenger, PassengerBaggageSelection } from '../types/baggage';
import { pricePassengerBaggage } from '../utils/baggageRules';
import { BaggageOption } from './BaggageOption';

export interface BaggageSelectorProps {
  passenger: BaggagePassenger;
  allowance: BaggageAllowance;
  selection: PassengerBaggageSelection;
  onChange: (selection: PassengerBaggageSelection) => void;
}

function priceLabel(kg: BaggageWeightKg, includedKg: number, alwaysPaid: boolean): {
  included: boolean;
  priceLabel: string;
} {
  if (!alwaysPaid && kg <= includedKg) {
    return { included: true, priceLabel: 'Included' };
  }
  return { included: false, priceLabel: `$${BAGGAGE_WEIGHT_PRICE_USD[kg]}` };
}

export function BaggageSelector({
  passenger,
  allowance,
  selection,
  onChange,
}: BaggageSelectorProps) {
  const infant = passenger.type === 'INFANT';
  const line = pricePassengerBaggage(selection, allowance, passenger.type);

  const update = (patch: Partial<PassengerBaggageSelection>) => {
    onChange({ ...selection, ...patch });
  };

  return (
    <AppCard
      title={passenger.displayName}
      subtitle={
        infant
          ? 'Infants travel with a 7KG cabin bag only.'
          : `Cabin included ${formatBaggageWeight(allowance.cabinKg)} · checked included ${
              allowance.checkedKg > 0 ? formatBaggageWeight(allowance.checkedKg) : 'none'
            }`
      }
    >
      <Stack spacing={2}>
        <Stack spacing={1} role="radiogroup" aria-label={`${passenger.displayName} cabin baggage`}>
          <Typography variant="subtitle2">{BAGGAGE_TYPE_LABELS.CABIN}</Typography>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
            {BAGGAGE_WEIGHTS_KG.map((kg) => {
              const meta = priceLabel(kg, allowance.cabinKg, false);
              return (
                <BaggageOption
                  key={`cabin-${kg}`}
                  name={`${passenger.id}-cabin`}
                  kg={kg}
                  selected={selection.cabinKg === kg}
                  disabled={infant && kg !== 7}
                  included={meta.included}
                  priceLabel={meta.priceLabel}
                  onSelect={() => update({ cabinKg: kg })}
                />
              );
            })}
          </Stack>
        </Stack>

        <Stack spacing={1} role="radiogroup" aria-label={`${passenger.displayName} checked baggage`}>
          <Typography variant="subtitle2">{BAGGAGE_TYPE_LABELS.CHECKED}</Typography>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
            <BaggageOption
              name={`${passenger.id}-checked`}
              kg={0}
              selected={selection.checkedKg === 0}
              disabled={infant}
              priceLabel="No checked bag"
              onSelect={() => update({ checkedKg: 0, additionalKg: 0 })}
            />
            {BAGGAGE_WEIGHTS_KG.map((kg) => {
              const meta = priceLabel(kg, allowance.checkedKg, false);
              return (
                <BaggageOption
                  key={`checked-${kg}`}
                  name={`${passenger.id}-checked`}
                  kg={kg}
                  selected={selection.checkedKg === kg}
                  disabled={infant}
                  included={meta.included}
                  priceLabel={meta.priceLabel}
                  onSelect={() => update({ checkedKg: kg })}
                />
              );
            })}
          </Stack>
        </Stack>

        <Stack
          spacing={1}
          role="radiogroup"
          aria-label={`${passenger.displayName} additional baggage`}
        >
          <Typography variant="subtitle2">{BAGGAGE_TYPE_LABELS.ADDITIONAL}</Typography>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
            <BaggageOption
              name={`${passenger.id}-additional`}
              kg={0}
              selected={selection.additionalKg === 0}
              disabled={infant}
              priceLabel="No extra bag"
              onSelect={() => update({ additionalKg: 0 })}
            />
            {BAGGAGE_WEIGHTS_KG.map((kg) => {
              const meta = priceLabel(kg, 0, true);
              return (
                <BaggageOption
                  key={`additional-${kg}`}
                  name={`${passenger.id}-additional`}
                  kg={kg}
                  selected={selection.additionalKg === kg}
                  disabled={infant || selection.checkedKg === 0}
                  included={false}
                  priceLabel={meta.priceLabel}
                  onSelect={() => update({ additionalKg: kg })}
                />
              );
            })}
          </Stack>
        </Stack>

        <Typography variant="body2" color="text.secondary">
          Passenger baggage fees ${line.total}
        </Typography>
      </Stack>
    </AppCard>
  );
}
