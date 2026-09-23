import Stack from '@mui/material/Stack';
import { useEffect, useState } from 'react';
import { AppButton, AppCard, AppInput } from '@/components/common';
import { FormField } from '@/components/forms';
import { selectSubtotal, useBookingStore } from '@/features/booking';
import { normalizePromoCode } from '../constants/promoCodes';
import { useValidatePromoCodeMutation } from '../hooks/useValidatePromoCode';
import type { AppliedPromoCode, PromoValidationResult } from '../types/promo';
import { toBookingPromoCode } from '../utils/promoRules';
import { PromoCodeResult } from './PromoCodeResult';

export interface PromoCodeInputProps {
  /** Override booking subtotal (defaults to store price breakdown). */
  subtotal?: number;
  currency?: string;
}

export function PromoCodeInput({ subtotal, currency }: PromoCodeInputProps) {
  const storeSubtotal = useBookingStore(selectSubtotal);
  const storeCurrency = useBookingStore((state) => state.priceBreakdown.currency);
  const storeDiscount = useBookingStore((state) => state.priceBreakdown.discount);
  const storedPromo = useBookingStore((state) => state.promoCode);
  const setPromoCode = useBookingStore((state) => state.setPromoCode);

  const resolvedSubtotal = subtotal ?? storeSubtotal;
  const resolvedCurrency = currency ?? storeCurrency;

  const [code, setCode] = useState(storedPromo?.code ?? '');
  const [result, setResult] = useState<PromoValidationResult | null>(null);
  const [applied, setApplied] = useState<AppliedPromoCode | null>(null);

  const mutation = useValidatePromoCodeMutation();

  useEffect(() => {
    if (!storedPromo) {
      setApplied(null);
      return;
    }

    setApplied({
      code: storedPromo.code,
      discountType: storedPromo.discountType,
      discountValue: storedPromo.discountValue,
      maxDiscount: storedPromo.maxDiscount ?? null,
      currency: storedPromo.currency ?? resolvedCurrency,
      description: storedPromo.description ?? storedPromo.code,
      discountAmount: storeDiscount,
    });
    setCode(storedPromo.code);
  }, [resolvedCurrency, storeDiscount, storedPromo]);

  const handleApply = async () => {
    const normalized = normalizePromoCode(code);
    setCode(normalized);
    setResult(null);

    try {
      const next = await mutation.mutateAsync({
        code: normalized,
        subtotal: resolvedSubtotal,
        currency: resolvedCurrency,
      });

      setResult(next);

      if (next.ok) {
        setApplied(next.promo);
        setPromoCode(toBookingPromoCode(next.promo));
      } else {
        setApplied(null);
        setPromoCode(null);
      }
    } catch {
      setApplied(null);
      setPromoCode(null);
      setResult({
        ok: false,
        status: 'INVALID',
        message: 'Unable to validate this promo code right now. Please try again.',
      });
    }
  };

  const handleRemove = () => {
    setApplied(null);
    setResult(null);
    setPromoCode(null);
    setCode('');
    mutation.reset();
  };

  return (
    <AppCard
      title="Promo code"
      subtitle="Apply a valid code to update your booking total."
    >
      <Stack spacing={2}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          sx={{ alignItems: { sm: 'flex-end' } }}
        >
          <FormField
            id="promo-code"
            label="Code"
            helperText="Try FLIGHT100 for RM100 off (min RM150)."
          >
            <AppInput
              value={code}
              onChange={(event) => {
                setCode(event.target.value.toUpperCase());
                setResult(null);
              }}
              placeholder="FLIGHT100"
              autoComplete="off"
              slotProps={{
                htmlInput: { 'aria-label': 'Promo code' },
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  void handleApply();
                }
              }}
            />
          </FormField>

          <Stack direction="row" spacing={1} sx={{ flexShrink: 0, pb: { sm: 0.25 } }}>
            <AppButton
              variant="contained"
              onClick={() => {
                void handleApply();
              }}
              loading={mutation.isPending}
              disabled={!code.trim() || mutation.isPending}
            >
              Apply
            </AppButton>
            {applied || storedPromo ? (
              <AppButton variant="outlined" color="inherit" onClick={handleRemove}>
                Remove
              </AppButton>
            ) : null}
          </Stack>
        </Stack>

        <PromoCodeResult
          result={result}
          applied={applied}
          isPending={mutation.isPending}
        />
      </Stack>
    </AppCard>
  );
}
