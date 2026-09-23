import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { AppAlert, AppBadge, AppCard } from '@/components/common';
import { formatPromoAmount } from '../constants/promoCodes';
import type { AppliedPromoCode, PromoValidationResult } from '../types/promo';

export interface PromoCodeResultProps {
  result: PromoValidationResult | null;
  applied?: AppliedPromoCode | null;
  isPending?: boolean;
}

export function PromoCodeResult({
  result,
  applied = null,
  isPending = false,
}: PromoCodeResultProps) {
  if (isPending) {
    return (
      <AppAlert severity="info" title="Checking promo code">
        Validating your code against current booking totals…
      </AppAlert>
    );
  }

  if (applied && (!result || result.ok)) {
    return (
      <AppCard title="Promo applied" subtitle={applied.description}>
        <Stack spacing={1}>
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
            <AppBadge label={applied.code} tone="success" />
            <AppBadge
              label={
                applied.discountType === 'PERCENT'
                  ? `${applied.discountValue}% off`
                  : formatPromoAmount(applied.discountValue, applied.currency)
              }
              tone="info"
              variant="outlined"
            />
          </Stack>
          <Typography variant="body2" color="text.secondary">
            You save {formatPromoAmount(applied.discountAmount, applied.currency)} on this
            booking.
          </Typography>
        </Stack>
      </AppCard>
    );
  }

  if (!result) {
    return null;
  }

  if (result.ok) {
    return (
      <AppAlert severity="success" title="Promo code valid">
        {result.message}
      </AppAlert>
    );
  }

  const title =
    result.status === 'EXPIRED'
      ? 'Promo expired'
      : result.status === 'BELOW_MINIMUM'
        ? 'Minimum not met'
        : 'Invalid promo code';

  return (
    <AppAlert severity="error" title={title}>
      {result.message}
    </AppAlert>
  );
}
