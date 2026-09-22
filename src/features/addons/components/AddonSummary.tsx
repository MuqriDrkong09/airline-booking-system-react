import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { AppButton, AppCard } from '@/components/common';
import { ADDON_CATALOG, formatAddonPrice } from '../constants/addons';
import type { AddonPassenger, AddonSelection } from '../types/addon';
import {
  calculateAddonTotal,
  calculateBookingTotal,
  getAddonById,
} from '../utils/addonRules';

export interface AddonSummaryProps {
  passengers: AddonPassenger[];
  selections: AddonSelection[];
  baggageTotal?: number;
  mealTotal?: number;
  seatTotal?: number;
  onRemove?: (addonId: string, passengerId: string) => void;
}

export function AddonSummary({
  passengers,
  selections,
  baggageTotal = 0,
  mealTotal = 0,
  seatTotal = 0,
  onRemove,
}: AddonSummaryProps) {
  const addonTotal = calculateAddonTotal(selections, ADDON_CATALOG);
  const bookingTotal = calculateBookingTotal({
    baggageTotal,
    mealTotal,
    addonTotal,
    seatTotal,
  });
  const passengerName = new Map(passengers.map((passenger) => [passenger.id, passenger.displayName]));

  return (
    <AppCard title="Add-ons summary" subtitle="Selected extras and updated booking total.">
      <Stack spacing={1.5}>
        {selections.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No add-ons selected yet.
          </Typography>
        ) : (
          selections.map((selection) => {
            const addon = getAddonById(selection.addonId, ADDON_CATALOG);
            if (!addon) {
              return null;
            }
            return (
              <Stack
                key={`${selection.passengerId}-${selection.addonId}`}
                direction="row"
                spacing={1}
                sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}
              >
                <Stack spacing={0.25} sx={{ minWidth: 0 }}>
                  <Typography variant="subtitle2" noWrap>
                    {addon.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {passengerName.get(selection.passengerId) ?? selection.passengerId}
                  </Typography>
                </Stack>
                <Stack spacing={0.5} sx={{ alignItems: 'flex-end' }}>
                  <Typography variant="body2">{formatAddonPrice(addon.price)}</Typography>
                  {onRemove ? (
                    <AppButton
                      size="small"
                      variant="text"
                      color="error"
                      onClick={() => onRemove(selection.addonId, selection.passengerId)}
                    >
                      Remove
                    </AppButton>
                  ) : null}
                </Stack>
              </Stack>
            );
          })
        )}

        <Divider />
        <Stack spacing={0.75}>
          <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">
              Add-ons
            </Typography>
            <Typography variant="body2">{formatAddonPrice(addonTotal)}</Typography>
          </Stack>
          <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">
              Baggage + meals + seats
            </Typography>
            <Typography variant="body2">
              {formatAddonPrice(baggageTotal + mealTotal + seatTotal)}
            </Typography>
          </Stack>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2">Booking total</Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {formatAddonPrice(bookingTotal)}
            </Typography>
          </Stack>
        </Stack>
      </Stack>
    </AppCard>
  );
}
