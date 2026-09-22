import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { AppCard } from '@/components/common';
import { ADDON_CATALOG } from '../constants/addons';
import type { AddonPassenger, AddonSelection } from '../types/addon';
import {
  addonsForPassenger,
  hasAddonSelection,
  removeAddon,
  selectAddon,
} from '../utils/addonRules';
import { AddonCard } from './AddonCard';

export interface AddonSelectorProps {
  passengers: AddonPassenger[];
  selections: AddonSelection[];
  onChange: (selections: AddonSelection[]) => void;
}

export function AddonSelector({ passengers, selections, onChange }: AddonSelectorProps) {
  return (
    <Stack spacing={2.5}>
      {passengers.map((passenger) => {
        const options = addonsForPassenger(passenger, ADDON_CATALOG);
        return (
          <AppCard
            key={passenger.id}
            title={passenger.displayName}
            subtitle={
              options.length === 0
                ? 'No add-ons apply to this passenger.'
                : 'Select optional extras for this traveler.'
            }
          >
            {options.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Infants only qualify for travel insurance when offered.
              </Typography>
            ) : (
              <Stack spacing={1.5}>
                {options.map((addon) => {
                  const selected = hasAddonSelection(selections, addon.id, passenger.id);
                  return (
                    <AddonCard
                      key={`${passenger.id}-${addon.id}`}
                      addon={addon}
                      selected={selected}
                      passengerLabel={passenger.displayName}
                      onSelect={() =>
                        onChange(selectAddon(selections, addon.id, passenger.id))
                      }
                      onRemove={() =>
                        onChange(removeAddon(selections, addon.id, passenger.id))
                      }
                    />
                  );
                })}
              </Stack>
            )}
          </AppCard>
        );
      })}
    </Stack>
  );
}
