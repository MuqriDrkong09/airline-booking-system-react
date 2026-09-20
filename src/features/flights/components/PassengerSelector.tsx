import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Minus, Plus } from 'lucide-react';

export interface PassengerCountControlProps {
  id: string;
  label: string;
  description?: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  errorMessage?: string;
}

export function PassengerCountControl({
  id,
  label,
  description,
  value,
  min,
  max,
  onChange,
  errorMessage,
}: PassengerCountControlProps) {
  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
      }}
    >
      <Stack spacing={0.25} sx={{ minWidth: 0 }}>
        <Typography id={`${id}-label`} variant="subtitle2" component="p" sx={{ fontWeight: 600 }}>
          {label}
        </Typography>
        {description ? (
          <Typography variant="caption" color="text.secondary">
            {description}
          </Typography>
        ) : null}
        {errorMessage ? (
          <Typography variant="caption" color="error">
            {errorMessage}
          </Typography>
        ) : null}
      </Stack>

      <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', flexShrink: 0 }}>
        <IconButton
          aria-label={`Decrease ${label}`}
          size="small"
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - 1))}
          sx={{
            border: 1,
            borderColor: 'divider',
            borderRadius: 1.5,
            width: 32,
            height: 32,
          }}
        >
          <Minus aria-hidden="true" size={14} />
        </IconButton>
        <Typography
          aria-labelledby={`${id}-label`}
          aria-live="polite"
          variant="body1"
          sx={{ minWidth: 28, textAlign: 'center', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}
        >
          {value}
        </Typography>
        <IconButton
          aria-label={`Increase ${label}`}
          size="small"
          disabled={value >= max}
          onClick={() => onChange(Math.min(max, value + 1))}
          sx={{
            border: 1,
            borderColor: 'divider',
            borderRadius: 1.5,
            width: 32,
            height: 32,
          }}
        >
          <Plus aria-hidden="true" size={14} />
        </IconButton>
      </Stack>
    </Stack>
  );
}
