import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { formatBaggageWeight } from '../constants/baggage';

export interface BaggageOptionProps {
  kg: number;
  selected: boolean;
  disabled?: boolean;
  priceLabel?: string;
  included?: boolean;
  onSelect: () => void;
  name: string;
}

export function BaggageOption({
  kg,
  selected,
  disabled = false,
  priceLabel,
  included = false,
  onSelect,
  name,
}: BaggageOptionProps) {
  return (
    <Box
      component="button"
      type="button"
      role="radio"
      name={name}
      aria-checked={selected}
      aria-disabled={disabled || undefined}
      disabled={disabled}
      onClick={() => {
        if (!disabled) {
          onSelect();
        }
      }}
      sx={{
        minWidth: 72,
        px: 1.25,
        py: 1,
        borderRadius: 1.5,
        border: '2px solid',
        borderColor: selected ? 'primary.main' : 'divider',
        bgcolor: selected ? 'action.selected' : 'background.paper',
        color: 'text.primary',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        textAlign: 'center',
      }}
    >
      <Typography variant="subtitle2" component="span" sx={{ display: 'block', fontWeight: 700 }}>
        {kg === 0 ? 'None' : formatBaggageWeight(kg)}
      </Typography>
      <Typography variant="caption" component="span" color="text.secondary">
        {included ? 'Included' : (priceLabel ?? '')}
      </Typography>
    </Box>
  );
}
