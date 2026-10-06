import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { AppInput, AppSelect } from '@/components/common';
import { FormField } from '@/components/forms/FormField';
import { DISCOUNT_TYPE_FORM_OPTIONS } from '../constants/options';
import {
  DEFAULT_PROMO_CODE_FORM_VALUES,
  promoCodeFormSchema,
  type PromoCodeFormParsedValues,
  type PromoCodeFormValues,
} from '../schemas/promoCodeFormSchema';
import type { AdminPromoCode } from '../types/adminPromoCode';

export interface PromoCodeFormProps {
  formId: string;
  initialPromoCode?: AdminPromoCode | null;
  onSubmit: (values: PromoCodeFormParsedValues) => void | Promise<void>;
}

function toFormValues(promo?: AdminPromoCode | null): PromoCodeFormValues {
  if (!promo) {
    return { ...DEFAULT_PROMO_CODE_FORM_VALUES };
  }

  return {
    code: promo.code,
    description: promo.description,
    discountType: promo.discountType,
    discountValue: promo.discountValue,
    minimumBookingAmount: promo.minimumBookingAmount,
    maximumDiscount: promo.maximumDiscount ?? '',
    startDate: promo.startDate,
    endDate: promo.endDate,
    usageLimit: promo.usageLimit ?? '',
    active: promo.active,
  };
}

export function PromoCodeForm({ formId, initialPromoCode, onSubmit }: PromoCodeFormProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PromoCodeFormValues, undefined, PromoCodeFormParsedValues>({
    resolver: zodResolver(promoCodeFormSchema),
    defaultValues: toFormValues(initialPromoCode),
  });

  useEffect(() => {
    reset(toFormValues(initialPromoCode));
  }, [initialPromoCode, reset]);

  return (
    <Stack
      component="form"
      id={formId}
      spacing={2}
      onSubmit={handleSubmit(async (values) => {
        await onSubmit(values);
      })}
      noValidate
    >
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2}>
        <Controller
          name="code"
          control={control}
          render={({ field }) => (
            <FormField id="promo-code" label="Code" required errorMessage={errors.code?.message}>
              <AppInput {...field} placeholder="SAVE15" autoComplete="off" />
            </FormField>
          )}
        />
        <Controller
          name="discountType"
          control={control}
          render={({ field }) => (
            <FormField
              id="promo-discount-type"
              label="Discount type"
              required
              errorMessage={errors.discountType?.message}
            >
              <AppSelect
                {...field}
                hideLabel
                label="Discount type"
                options={DISCOUNT_TYPE_FORM_OPTIONS}
              />
            </FormField>
          )}
        />
      </Stack>

      <Controller
        name="description"
        control={control}
        render={({ field }) => (
          <FormField
            id="promo-description"
            label="Description"
            required
            errorMessage={errors.description?.message}
          >
            <AppInput {...field} placeholder="15% off bookings" />
          </FormField>
        )}
      />

      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2}>
        <Controller
          name="discountValue"
          control={control}
          render={({ field }) => (
            <FormField
              id="promo-discount-value"
              label="Discount value"
              required
              errorMessage={errors.discountValue?.message}
            >
              <AppInput
                {...field}
                type="number"
                slotProps={{ htmlInput: { min: 0, step: 'any' } }}
                value={field.value === undefined || field.value === null ? '' : field.value}
              />
            </FormField>
          )}
        />
        <Controller
          name="minimumBookingAmount"
          control={control}
          render={({ field }) => (
            <FormField
              id="promo-min-booking"
              label="Minimum booking amount"
              required
              errorMessage={errors.minimumBookingAmount?.message}
            >
              <AppInput
                {...field}
                type="number"
                slotProps={{ htmlInput: { min: 0, step: 'any' } }}
                value={field.value === undefined || field.value === null ? '' : field.value}
              />
            </FormField>
          )}
        />
        <Controller
          name="maximumDiscount"
          control={control}
          render={({ field }) => (
            <FormField
              id="promo-max-discount"
              label="Maximum discount"
              errorMessage={errors.maximumDiscount?.message}
              helperText="Leave blank for no cap"
            >
              <AppInput
                {...field}
                type="number"
                slotProps={{ htmlInput: { min: 0, step: 'any' } }}
                value={field.value === undefined || field.value === null ? '' : field.value}
              />
            </FormField>
          )}
        />
      </Stack>

      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2}>
        <Controller
          name="startDate"
          control={control}
          render={({ field }) => (
            <FormField
              id="promo-start-date"
              label="Start date"
              required
              errorMessage={errors.startDate?.message}
            >
              <AppInput {...field} type="date" />
            </FormField>
          )}
        />
        <Controller
          name="endDate"
          control={control}
          render={({ field }) => (
            <FormField
              id="promo-end-date"
              label="End date"
              required
              errorMessage={errors.endDate?.message}
            >
              <AppInput {...field} type="date" />
            </FormField>
          )}
        />
        <Controller
          name="usageLimit"
          control={control}
          render={({ field }) => (
            <FormField
              id="promo-usage-limit"
              label="Usage limit"
              errorMessage={errors.usageLimit?.message}
              helperText="Leave blank for unlimited"
            >
              <AppInput
                {...field}
                type="number"
                slotProps={{ htmlInput: { min: 1, step: 1 } }}
                value={field.value === undefined || field.value === null ? '' : field.value}
              />
            </FormField>
          )}
        />
      </Stack>

      <Controller
        name="active"
        control={control}
        render={({ field }) => (
          <FormControlLabel
            control={
              <Switch
                checked={field.value}
                onChange={(event) => field.onChange(event.target.checked)}
                slotProps={{ input: { 'aria-label': 'Active' } }}
              />
            }
            label="Active"
          />
        )}
      />
    </Stack>
  );
}
