import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { AppInput } from '@/components/common';
import { FormField } from '@/components/forms/FormField';
import {
  DEFAULT_AIRPORT_FORM_VALUES,
  airportFormSchema,
  type AirportFormParsedValues,
  type AirportFormValues,
} from '../schemas/airportFormSchema';
import type { AdminAirport } from '../types/adminAirport';

export interface AirportFormProps {
  formId: string;
  initialAirport?: AdminAirport | null;
  onSubmit: (values: AirportFormParsedValues) => void | Promise<void>;
}

function toFormValues(airport?: AdminAirport | null): AirportFormValues {
  if (!airport) {
    return { ...DEFAULT_AIRPORT_FORM_VALUES };
  }

  return {
    code: airport.code,
    name: airport.name,
    city: airport.city,
    country: airport.country,
    timezone: airport.timezone,
    terminals: airport.terminalCount,
    latitude: airport.latitude,
    longitude: airport.longitude,
    active: airport.active,
  };
}

export function AirportForm({ formId, initialAirport, onSubmit }: AirportFormProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AirportFormValues, undefined, AirportFormParsedValues>({
    resolver: zodResolver(airportFormSchema),
    defaultValues: toFormValues(initialAirport),
  });

  useEffect(() => {
    reset(toFormValues(initialAirport));
  }, [initialAirport, reset]);

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
            <FormField
              id="airport-code"
              label="Code"
              required
              errorMessage={errors.code?.message}
            >
              <AppInput
                {...field}
                placeholder="KUL"
                autoComplete="off"
                slotProps={{ htmlInput: { maxLength: 3 } }}
              />
            </FormField>
          )}
        />
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <FormField
              id="airport-name"
              label="Name"
              required
              errorMessage={errors.name?.message}
            >
              <AppInput {...field} placeholder="Kuala Lumpur International Airport" />
            </FormField>
          )}
        />
      </Stack>

      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2}>
        <Controller
          name="city"
          control={control}
          render={({ field }) => (
            <FormField
              id="airport-city"
              label="City"
              required
              errorMessage={errors.city?.message}
            >
              <AppInput {...field} placeholder="Kuala Lumpur" />
            </FormField>
          )}
        />
        <Controller
          name="country"
          control={control}
          render={({ field }) => (
            <FormField
              id="airport-country"
              label="Country"
              required
              errorMessage={errors.country?.message}
            >
              <AppInput {...field} placeholder="Malaysia" />
            </FormField>
          )}
        />
      </Stack>

      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2}>
        <Controller
          name="timezone"
          control={control}
          render={({ field }) => (
            <FormField
              id="airport-timezone"
              label="Timezone"
              required
              errorMessage={errors.timezone?.message}
            >
              <AppInput {...field} placeholder="Asia/Kuala_Lumpur" autoComplete="off" />
            </FormField>
          )}
        />
        <Controller
          name="terminals"
          control={control}
          render={({ field }) => (
            <FormField
              id="airport-terminals"
              label="Terminals"
              required
              errorMessage={errors.terminals?.message}
            >
              <AppInput
                {...field}
                type="number"
                slotProps={{ htmlInput: { min: 1, max: 20, step: 1 } }}
                onChange={(event) => field.onChange(event.target.value)}
              />
            </FormField>
          )}
        />
      </Stack>

      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2}>
        <Controller
          name="latitude"
          control={control}
          render={({ field }) => (
            <FormField
              id="airport-latitude"
              label="Latitude"
              required
              errorMessage={errors.latitude?.message}
            >
              <AppInput
                {...field}
                type="number"
                slotProps={{ htmlInput: { min: -90, max: 90, step: 'any' } }}
                onChange={(event) => field.onChange(event.target.value)}
              />
            </FormField>
          )}
        />
        <Controller
          name="longitude"
          control={control}
          render={({ field }) => (
            <FormField
              id="airport-longitude"
              label="Longitude"
              required
              errorMessage={errors.longitude?.message}
            >
              <AppInput
                {...field}
                type="number"
                slotProps={{ htmlInput: { min: -180, max: 180, step: 'any' } }}
                onChange={(event) => field.onChange(event.target.value)}
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
                onChange={(_, checked) => field.onChange(checked)}
                slotProps={{ input: { 'aria-label': 'Active' } }}
              />
            }
            label={field.value ? 'Active' : 'Inactive'}
          />
        )}
      />
    </Stack>
  );
}
