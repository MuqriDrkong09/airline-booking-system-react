import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { AppInput } from '@/components/common';
import { FormField } from '@/components/forms/FormField';
import {
  DEFAULT_AIRCRAFT_FORM_VALUES,
  aircraftFormSchema,
  type AircraftFormParsedValues,
  type AircraftFormValues,
} from '../schemas/aircraftFormSchema';
import type { AdminAircraft } from '../types/adminAircraft';

export interface AircraftFormProps {
  formId: string;
  initialAircraft?: AdminAircraft | null;
  onSubmit: (values: AircraftFormParsedValues) => void | Promise<void>;
}

function toFormValues(aircraft?: AdminAircraft | null): AircraftFormValues {
  if (!aircraft) {
    return { ...DEFAULT_AIRCRAFT_FORM_VALUES };
  }

  return {
    manufacturer: aircraft.manufacturer,
    model: aircraft.model,
    registration: aircraft.registration,
    totalSeats: aircraft.totalSeats,
    economySeats: aircraft.economySeats,
    premiumEconomySeats: aircraft.premiumEconomySeats,
    businessSeats: aircraft.businessSeats,
    firstClassSeats: aircraft.firstClassSeats,
    active: aircraft.active,
  };
}

export function AircraftForm({ formId, initialAircraft, onSubmit }: AircraftFormProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AircraftFormValues, undefined, AircraftFormParsedValues>({
    resolver: zodResolver(aircraftFormSchema),
    defaultValues: toFormValues(initialAircraft),
  });

  useEffect(() => {
    reset(toFormValues(initialAircraft));
  }, [initialAircraft, reset]);

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
          name="manufacturer"
          control={control}
          render={({ field }) => (
            <FormField
              id="aircraft-manufacturer"
              label="Manufacturer"
              required
              errorMessage={errors.manufacturer?.message}
            >
              <AppInput {...field} placeholder="Airbus" autoComplete="off" />
            </FormField>
          )}
        />
        <Controller
          name="model"
          control={control}
          render={({ field }) => (
            <FormField
              id="aircraft-model"
              label="Model"
              required
              errorMessage={errors.model?.message}
            >
              <AppInput {...field} placeholder="A320" autoComplete="off" />
            </FormField>
          )}
        />
      </Stack>

      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2}>
        <Controller
          name="registration"
          control={control}
          render={({ field }) => (
            <FormField
              id="aircraft-registration"
              label="Registration"
              required
              errorMessage={errors.registration?.message}
            >
              <AppInput {...field} placeholder="9M-AAA" autoComplete="off" />
            </FormField>
          )}
        />
        <Controller
          name="totalSeats"
          control={control}
          render={({ field }) => (
            <FormField
              id="aircraft-total-seats"
              label="Total seats"
              required
              errorMessage={errors.totalSeats?.message}
            >
              <AppInput
                {...field}
                type="number"
                slotProps={{ htmlInput: { min: 1, max: 600, step: 1 } }}
                onChange={(event) => field.onChange(event.target.value)}
              />
            </FormField>
          )}
        />
      </Stack>

      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2}>
        <Controller
          name="economySeats"
          control={control}
          render={({ field }) => (
            <FormField
              id="aircraft-economy-seats"
              label="Economy seats"
              required
              errorMessage={errors.economySeats?.message}
            >
              <AppInput
                {...field}
                type="number"
                slotProps={{ htmlInput: { min: 0, max: 600, step: 1 } }}
                onChange={(event) => field.onChange(event.target.value)}
              />
            </FormField>
          )}
        />
        <Controller
          name="premiumEconomySeats"
          control={control}
          render={({ field }) => (
            <FormField
              id="aircraft-premium-economy-seats"
              label="Premium economy seats"
              required
              errorMessage={errors.premiumEconomySeats?.message}
            >
              <AppInput
                {...field}
                type="number"
                slotProps={{ htmlInput: { min: 0, max: 600, step: 1 } }}
                onChange={(event) => field.onChange(event.target.value)}
              />
            </FormField>
          )}
        />
      </Stack>

      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2}>
        <Controller
          name="businessSeats"
          control={control}
          render={({ field }) => (
            <FormField
              id="aircraft-business-seats"
              label="Business seats"
              required
              errorMessage={errors.businessSeats?.message}
            >
              <AppInput
                {...field}
                type="number"
                slotProps={{ htmlInput: { min: 0, max: 600, step: 1 } }}
                onChange={(event) => field.onChange(event.target.value)}
              />
            </FormField>
          )}
        />
        <Controller
          name="firstClassSeats"
          control={control}
          render={({ field }) => (
            <FormField
              id="aircraft-first-class-seats"
              label="First class seats"
              required
              errorMessage={errors.firstClassSeats?.message}
            >
              <AppInput
                {...field}
                type="number"
                slotProps={{ htmlInput: { min: 0, max: 600, step: 1 } }}
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
