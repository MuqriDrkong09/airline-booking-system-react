import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { ADDON_CATALOG, formatAddonPrice, getAddonById } from '@/features/addons';
import type { AddonSelection } from '@/features/addons';
import { PASSENGER_TYPE_LABELS, type PassengerDraft } from '@/features/passengers';
import { passengerDisplayName } from '@/features/seats';
import { formatBookingMoney } from '../utils/formatMoney';
import { SummarySection } from './SummarySection';

export interface AddonSummaryProps {
  addons: AddonSelection[];
  passengers: PassengerDraft[];
  addonTotal: number;
  currency?: string;
  editTo?: string;
}

export function AddonSummary({
  addons,
  passengers,
  addonTotal,
  currency = 'USD',
  editTo,
}: AddonSummaryProps) {
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
      title="Add-ons"
      editTo={editTo}
      empty={addons.length === 0}
      emptyMessage="No add-ons selected."
    >
      <Stack spacing={1.25}>
        {addons.map((selection) => {
          const addon = getAddonById(selection.addonId, ADDON_CATALOG);
          if (!addon) {
            return null;
          }
          return (
            <Stack
              key={`${selection.passengerId}-${selection.addonId}`}
              direction="row"
              sx={{ justifyContent: 'space-between', gap: 1 }}
            >
              <Stack spacing={0.25} sx={{ minWidth: 0 }}>
                <Typography variant="subtitle2" noWrap>
                  {addon.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {nameById.get(selection.passengerId) ?? selection.passengerId}
                </Typography>
              </Stack>
              <Typography variant="body2">{formatAddonPrice(addon.price)}</Typography>
            </Stack>
          );
        })}
        <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
          <Typography variant="body2" color="text.secondary">
            Add-ons total
          </Typography>
          <Typography variant="subtitle2">
            {formatBookingMoney(addonTotal, currency)}
          </Typography>
        </Stack>
      </Stack>
    </SummarySection>
  );
}
