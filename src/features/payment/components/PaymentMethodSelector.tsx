import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { AppBadge, AppButton, AppCard } from '@/components/common';
import type { PaymentMethod } from '@/features/booking';
import { PAYMENT_METHOD_OPTIONS } from '../constants/paymentMethods';

export interface PaymentMethodSelectorProps {
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
  disabled?: boolean;
}

export function PaymentMethodSelector({
  value,
  onChange,
  disabled = false,
}: PaymentMethodSelectorProps) {
  return (
    <AppCard title="Payment method" subtitle="Choose how you want to pay.">
      <Stack spacing={1.25} role="radiogroup" aria-label="Payment method">
        {PAYMENT_METHOD_OPTIONS.map((option) => {
          const selected = value === option.value;
          return (
            <AppButton
              key={option.value}
              type="button"
              variant={selected ? 'contained' : 'outlined'}
              color={selected ? 'primary' : 'inherit'}
              disabled={disabled}
              onClick={() => onChange(option.value)}
              aria-pressed={selected}
              sx={{
                justifyContent: 'flex-start',
                textAlign: 'left',
                py: 1.5,
                px: 2,
                textTransform: 'none',
              }}
            >
              <Stack spacing={0.5} sx={{ width: '100%' }}>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <Typography variant="subtitle2">{option.label}</Typography>
                  {selected ? <AppBadge label="Selected" size="small" tone="success" /> : null}
                </Stack>
                <Typography variant="body2" color={selected ? 'inherit' : 'text.secondary'}>
                  {option.description}
                </Typography>
              </Stack>
            </AppButton>
          );
        })}
      </Stack>
    </AppCard>
  );
}
