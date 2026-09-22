import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { AppBadge, AppButton, AppCard } from '@/components/common';
import { formatAddonPrice, type Addon } from '../constants/addons';

export interface AddonCardProps {
  addon: Addon;
  selected: boolean;
  disabled?: boolean;
  passengerLabel?: string;
  onSelect: () => void;
  onRemove: () => void;
}

export function AddonCard({
  addon,
  selected,
  disabled = false,
  passengerLabel,
  onSelect,
  onRemove,
}: AddonCardProps) {
  const unavailable = !addon.availability;
  const isDisabled = disabled || unavailable;

  return (
    <AppCard
      title={addon.name}
      subtitle={passengerLabel}
      outlined
      action={
        <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 700, pr: 1 }}>
          {formatAddonPrice(addon.price)}
        </Typography>
      }
      footer={
        <Stack
          direction="row"
          spacing={1}
          sx={{ width: '100%', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap' }}>
            {unavailable ? (
              <AppBadge label="Unavailable" size="small" tone="warning" />
            ) : selected ? (
              <AppBadge label="Selected" size="small" tone="primary" />
            ) : (
              <AppBadge label="Available" size="small" tone="success" />
            )}
          </Stack>
          {selected ? (
            <AppButton
              size="small"
              variant="text"
              color="error"
              disabled={isDisabled}
              onClick={onRemove}
            >
              Remove
            </AppButton>
          ) : (
            <AppButton
              size="small"
              variant="contained"
              disabled={isDisabled}
              onClick={onSelect}
            >
              Add
            </AppButton>
          )}
        </Stack>
      }
    >
      <Typography variant="body2" color="text.secondary">
        {addon.description}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
        Applies to:{' '}
        {addon.passengerApplicability
          .map((type) => type.charAt(0) + type.slice(1).toLowerCase())
          .join(', ')}
      </Typography>
    </AppCard>
  );
}
