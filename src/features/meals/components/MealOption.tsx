import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { AppBadge } from '@/components/common';
import { formatMealPrice, type MealCatalogItem } from '../constants/meals';

export interface MealOptionProps {
  meal: MealCatalogItem;
  selected: boolean;
  disabled?: boolean;
  onSelect: () => void;
}

export function MealOption({ meal, selected, disabled = false, onSelect }: MealOptionProps) {
  const unavailable = !meal.available || meal.remaining <= 0;
  const isDisabled = disabled || unavailable;

  return (
    <Box
      component="button"
      type="button"
      role="radio"
      aria-checked={selected}
      aria-disabled={isDisabled || undefined}
      disabled={isDisabled}
      onClick={() => {
        if (!isDisabled) {
          onSelect();
        }
      }}
      sx={{
        width: '100%',
        textAlign: 'left',
        p: 1.5,
        borderRadius: 1.5,
        border: '2px solid',
        borderColor: selected ? 'primary.main' : 'divider',
        bgcolor: selected ? 'action.selected' : 'background.paper',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.55 : 1,
      }}
    >
      <Stack spacing={0.75}>
        <Stack
          direction="row"
          spacing={1}
          sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            {meal.label}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
            {formatMealPrice(meal.price)}
          </Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary">
          {meal.description}
        </Typography>
        <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap' }}>
          {unavailable ? (
            <AppBadge label="Unavailable" size="small" tone="warning" />
          ) : (
            <AppBadge label={`${meal.remaining} left`} size="small" tone="info" />
          )}
          {selected ? <AppBadge label="Selected" size="small" tone="primary" /> : null}
        </Stack>
      </Stack>
    </Box>
  );
}
