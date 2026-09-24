import Stack from '@mui/material/Stack';
import { Controller, useFormContext } from 'react-hook-form';
import { AppCard, AppInput } from '@/components/common';
import { FormField } from '@/components/forms';
import {
  formatCardNumberInput,
  formatExpiryInput,
  type CardFormSchemaInput,
} from '../schemas/cardSchema';
import {
  MOCK_DECLINE_CARD_NUMBER,
  MOCK_SUCCESS_CARD_NUMBER,
} from '../constants/paymentMethods';

export interface CardFormProps {
  disabled?: boolean;
}

export function CardForm({ disabled = false }: CardFormProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext<CardFormSchemaInput>();

  return (
    <AppCard
      title="Card details"
      subtitle="Card data is validated locally and never saved to this app."
    >
      <Stack spacing={2}>
        <Controller
          name="cardNumber"
          control={control}
          render={({ field }) => (
            <FormField
              id="card-number"
              label="Card number"
              required
              errorMessage={errors.cardNumber?.message}
              helperText={`Try ${MOCK_SUCCESS_CARD_NUMBER} (success) or ${MOCK_DECLINE_CARD_NUMBER} (decline).`}
            >
              <AppInput
                {...field}
                value={field.value}
                onChange={(event) => field.onChange(formatCardNumberInput(event.target.value))}
                inputMode="numeric"
                autoComplete="cc-number"
                placeholder="ACCT-000006"
                disabled={disabled}
                slotProps={{
                  htmlInput: { 'aria-label': 'Card number', maxLength: 23 },
                }}
              />
            </FormField>
          )}
        />

        <Controller
          name="cardHolder"
          control={control}
          render={({ field }) => (
            <FormField
              id="card-holder"
              label="Cardholder name"
              required
              errorMessage={errors.cardHolder?.message}
            >
              <AppInput
                {...field}
                autoComplete="cc-name"
                placeholder="Name on card"
                disabled={disabled}
                slotProps={{
                  htmlInput: { 'aria-label': 'Cardholder name' },
                }}
              />
            </FormField>
          )}
        />

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Controller
            name="expiryDate"
            control={control}
            render={({ field }) => (
              <FormField
                id="card-expiry"
                label="Expiry date"
                required
                errorMessage={errors.expiryDate?.message}
                helperText="MM/YY"
              >
                <AppInput
                  {...field}
                  value={field.value}
                  onChange={(event) => field.onChange(formatExpiryInput(event.target.value))}
                  inputMode="numeric"
                  autoComplete="cc-exp"
                  placeholder="MM/YY"
                  disabled={disabled}
                  slotProps={{
                    htmlInput: { 'aria-label': 'Expiry date', maxLength: 5 },
                  }}
                />
              </FormField>
            )}
          />

          <Controller
            name="cvv"
            control={control}
            render={({ field }) => (
              <FormField
                id="card-cvv"
                label="CVV"
                required
                errorMessage={errors.cvv?.message}
                helperText="3 or 4 digits"
              >
                <AppInput
                  {...field}
                  type="password"
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  placeholder="123"
                  disabled={disabled}
                  slotProps={{
                    htmlInput: { 'aria-label': 'CVV', maxLength: 4 },
                  }}
                />
              </FormField>
            )}
          />
        </Stack>
      </Stack>
    </AppCard>
  );
}
