import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import FormHelperText from '@mui/material/FormHelperText';
import FormLabel from '@mui/material/FormLabel';
import Stack from '@mui/material/Stack';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { AppInput, AppSelect } from '@/components/common';
import type { AppSelectOption } from '@/components/common/AppSelect';
import { FormField } from '@/components/forms/FormField';
import type { CabinClass } from '@/features/flights';
import {
  AIRCRAFT_OPTIONS,
  AIRLINE_OPTIONS,
  AIRPORT_OPTIONS,
  CABIN_CLASS_OPTIONS,
  STATUS_OPTIONS,
} from '../constants/options';

const AIRLINE_FORM_OPTIONS: readonly AppSelectOption[] = [
  { value: '', label: 'Select airline', disabled: true },
  ...AIRLINE_OPTIONS,
];
const AIRPORT_FORM_OPTIONS: readonly AppSelectOption[] = [
  { value: '', label: 'Select airport', disabled: true },
  ...AIRPORT_OPTIONS,
];
const AIRCRAFT_FORM_OPTIONS: readonly AppSelectOption[] = [
  { value: '', label: 'Select aircraft', disabled: true },
  ...AIRCRAFT_OPTIONS,
];
import {
  DEFAULT_FLIGHT_FORM_VALUES,
  flightFormSchema,
  type FlightFormParsedValues,
  type FlightFormValues,
} from '../schemas/flightFormSchema';
import type { AdminFlight } from '../types/adminFlight';

export interface FlightFormProps {
  formId: string;
  initialFlight?: AdminFlight | null;
  onSubmit: (values: FlightFormParsedValues) => void | Promise<void>;
}

function toFormValues(flight?: AdminFlight | null): FlightFormValues {
  if (!flight) {
    return { ...DEFAULT_FLIGHT_FORM_VALUES, fareClasses: [...DEFAULT_FLIGHT_FORM_VALUES.fareClasses] };
  }

  return {
    airline: flight.airline,
    flightNumber: flight.flightNumber,
    origin: flight.origin,
    destination: flight.destination,
    aircraft: flight.aircraft,
    departure: flight.departure,
    arrival: flight.arrival,
    terminal: flight.terminal,
    gate: flight.gate,
    status: flight.status,
    availableSeats: flight.availableSeats,
    fareClasses: [...flight.fareClasses],
  };
}

export function FlightForm({ formId, initialFlight, onSubmit }: FlightFormProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FlightFormValues, undefined, FlightFormParsedValues>({
    resolver: zodResolver(flightFormSchema),
    defaultValues: toFormValues(initialFlight),
  });

  useEffect(() => {
    reset(toFormValues(initialFlight));
  }, [initialFlight, reset]);

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
          name="airline"
          control={control}
          render={({ field }) => (
            <FormField
              id="flight-airline"
              label="Airline"
              required
              errorMessage={errors.airline?.message}
            >
              <AppSelect
                {...field}
                hideLabel
                label="Airline"
                options={AIRLINE_FORM_OPTIONS}
                displayEmpty
              />
            </FormField>
          )}
        />
        <Controller
          name="flightNumber"
          control={control}
          render={({ field }) => (
            <FormField
              id="flight-number"
              label="Flight number"
              required
              errorMessage={errors.flightNumber?.message}
            >
              <AppInput {...field} placeholder="MH123" autoComplete="off" />
            </FormField>
          )}
        />
      </Stack>

      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2}>
        <Controller
          name="origin"
          control={control}
          render={({ field }) => (
            <FormField
              id="flight-origin"
              label="Origin"
              required
              errorMessage={errors.origin?.message}
            >
              <AppSelect
                {...field}
                hideLabel
                label="Origin"
                options={AIRPORT_FORM_OPTIONS}
                displayEmpty
              />
            </FormField>
          )}
        />
        <Controller
          name="destination"
          control={control}
          render={({ field }) => (
            <FormField
              id="flight-destination"
              label="Destination"
              required
              errorMessage={errors.destination?.message}
            >
              <AppSelect
                {...field}
                hideLabel
                label="Destination"
                options={AIRPORT_FORM_OPTIONS}
                displayEmpty
              />
            </FormField>
          )}
        />
      </Stack>

      <Controller
        name="aircraft"
        control={control}
        render={({ field }) => (
          <FormField
            id="flight-aircraft"
            label="Aircraft"
            required
            errorMessage={errors.aircraft?.message}
          >
            <AppSelect
              {...field}
              hideLabel
              label="Aircraft"
              options={AIRCRAFT_FORM_OPTIONS}
              displayEmpty
            />
          </FormField>
        )}
      />

      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2}>
        <Controller
          name="departure"
          control={control}
          render={({ field }) => (
            <FormField
              id="flight-departure"
              label="Departure"
              required
              errorMessage={errors.departure?.message}
            >
              <AppInput {...field} type="datetime-local" />
            </FormField>
          )}
        />
        <Controller
          name="arrival"
          control={control}
          render={({ field }) => (
            <FormField
              id="flight-arrival"
              label="Arrival"
              required
              errorMessage={errors.arrival?.message}
            >
              <AppInput {...field} type="datetime-local" />
            </FormField>
          )}
        />
      </Stack>

      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2}>
        <Controller
          name="terminal"
          control={control}
          render={({ field }) => (
            <FormField
              id="flight-terminal"
              label="Terminal"
              required
              errorMessage={errors.terminal?.message}
            >
              <AppInput {...field} placeholder="T1" />
            </FormField>
          )}
        />
        <Controller
          name="gate"
          control={control}
          render={({ field }) => (
            <FormField
              id="flight-gate"
              label="Gate"
              required
              errorMessage={errors.gate?.message}
            >
              <AppInput {...field} placeholder="A12" />
            </FormField>
          )}
        />
      </Stack>

      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2}>
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <FormField
              id="flight-status"
              label="Status"
              required
              errorMessage={errors.status?.message}
            >
              <AppSelect {...field} hideLabel label="Status" options={STATUS_OPTIONS} />
            </FormField>
          )}
        />
        <Controller
          name="availableSeats"
          control={control}
          render={({ field }) => (
            <FormField
              id="flight-available-seats"
              label="Available seats"
              required
              errorMessage={errors.availableSeats?.message}
            >
              <AppInput
                {...field}
                type="number"
                slotProps={{ htmlInput: { min: 0, max: 850, step: 1 } }}
                onChange={(event) => field.onChange(event.target.value)}
              />
            </FormField>
          )}
        />
      </Stack>

      <Controller
        name="fareClasses"
        control={control}
        render={({ field }) => (
          <FormControl
            required
            error={Boolean(errors.fareClasses)}
            component="fieldset"
            variant="standard"
          >
            <FormLabel component="legend" sx={{ mb: 1, fontWeight: 600 }}>
              Fare classes
            </FormLabel>
            <FormGroup row>
              {CABIN_CLASS_OPTIONS.map((option) => {
                const checked = field.value.includes(option.value);
                return (
                  <FormControlLabel
                    key={option.value}
                    control={
                      <Checkbox
                        checked={checked}
                        onChange={(_, isChecked) => {
                          const next = isChecked
                            ? [...field.value, option.value]
                            : field.value.filter((item: CabinClass) => item !== option.value);
                          field.onChange(next);
                        }}
                      />
                    }
                    label={option.label}
                  />
                );
              })}
            </FormGroup>
            {errors.fareClasses?.message ? (
              <FormHelperText>{errors.fareClasses.message}</FormHelperText>
            ) : null}
          </FormControl>
        )}
      />
    </Stack>
  );
}
