import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeftRight, Plus, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import {
  AppAlert,
  AppButton,
  AppCard,
  AppInput,
  AppSelect,
} from '@/components/common';
import { FormField } from '@/components/forms/FormField';
import {
  CABIN_CLASS_OPTIONS,
  MAX_MULTI_CITY_LEGS,
  MAX_PASSENGERS,
  MIN_ADULTS,
  MIN_MULTI_CITY_LEGS,
} from '../constants/search';
import {
  createEmptyLeg,
  flightSearchSchema,
  type FlightSearchSchemaValues,
} from '../schemas/searchSchema';
import type { FlightSearchFormValues, TripType } from '../types';
import { todayIsoDate } from '../utils/dates';
import { AirportAutocomplete } from './AirportAutocomplete';
import { PassengerCountControl } from './PassengerSelector';
import { TripTypeSelector } from './TripTypeSelector';

export interface FlightSearchFormProps {
  defaultValues: FlightSearchFormValues;
  /** Remount/reset key when URL hydration completes or changes. */
  formKey?: string;
  disabled?: boolean;
  onSearch: (values: FlightSearchFormValues) => void;
}

function AirportPairFields({
  originId,
  destinationId,
  origin,
  destination,
  originError,
  destinationError,
  onOriginChange,
  onDestinationChange,
  onSwap,
}: {
  originId: string;
  destinationId: string;
  origin: FlightSearchFormValues['origin'];
  destination: FlightSearchFormValues['destination'];
  originError?: string;
  destinationError?: string;
  onOriginChange: (airport: FlightSearchFormValues['origin']) => void;
  onDestinationChange: (airport: FlightSearchFormValues['destination']) => void;
  onSwap: () => void;
}) {
  return (
    <Box
      sx={{
        display: 'grid',
        gap: { xs: 1.5, md: 1.5 },
        gridTemplateColumns: {
          xs: '1fr',
          md: 'minmax(0, 1fr) auto minmax(0, 1fr)',
        },
        alignItems: 'start',
      }}
    >
      <AirportAutocomplete
        id={originId}
        label="From"
        value={origin}
        onChange={onOriginChange}
        required
        errorMessage={originError}
        excludeAirportCode={destination?.code}
      />

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          pt: { md: 4.25 },
          order: { xs: 0, md: 0 },
        }}
      >
        <IconButton
          aria-label="Swap origin and destination"
          onClick={onSwap}
          disabled={!origin && !destination}
          color="primary"
          sx={{
            width: 40,
            height: 40,
            border: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
            boxShadow: (theme) => theme.shadows[1],
            '&:hover': {
              borderColor: 'primary.main',
              bgcolor: 'action.hover',
            },
            '&.Mui-disabled': {
              bgcolor: 'action.hover',
            },
          }}
        >
          <ArrowLeftRight aria-hidden="true" size={18} />
        </IconButton>
      </Box>

      <AirportAutocomplete
        id={destinationId}
        label="To"
        value={destination}
        onChange={onDestinationChange}
        required
        errorMessage={destinationError}
        excludeAirportCode={origin?.code}
      />
    </Box>
  );
}

export function FlightSearchForm({
  defaultValues,
  formKey,
  disabled = false,
  onSearch,
}: FlightSearchFormProps) {
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<FlightSearchSchemaValues>({
    resolver: zodResolver(flightSearchSchema),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'legs',
  });

  const tripType = useWatch({ control, name: 'tripType' });
  const adults = useWatch({ control, name: 'adults' }) ?? 1;
  const children = useWatch({ control, name: 'children' }) ?? 0;
  const infants = useWatch({ control, name: 'infants' }) ?? 0;
  const origin = useWatch({ control, name: 'origin' });
  const destination = useWatch({ control, name: 'destination' });
  const departureDate = useWatch({ control, name: 'departureDate' });
  const minDate = todayIsoDate();

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, formKey, reset]);

  const handleTripTypeChange = (nextType: TripType) => {
    const current = getValues();
    setValue('tripType', nextType, { shouldValidate: true });

    if (nextType === 'MULTI_CITY') {
      const firstLeg = current.legs[0] ?? createEmptyLeg(current.departureDate || minDate);
      const secondLeg = current.legs[1] ?? createEmptyLeg(current.departureDate || minDate);
      setValue(
        'legs',
        [
          {
            origin: current.origin ?? firstLeg.origin,
            destination: current.destination ?? firstLeg.destination,
            departureDate: current.departureDate || firstLeg.departureDate,
          },
          {
            origin: current.destination ?? secondLeg.origin,
            destination: secondLeg.destination,
            departureDate: current.returnDate || secondLeg.departureDate,
          },
          ...current.legs.slice(2),
        ],
        { shouldValidate: false },
      );
      return;
    }

    if (current.legs[0]) {
      setValue('origin', current.legs[0].origin ?? current.origin, { shouldValidate: false });
      setValue('destination', current.legs[0].destination ?? current.destination, {
        shouldValidate: false,
      });
      setValue('departureDate', current.legs[0].departureDate || current.departureDate, {
        shouldValidate: false,
      });
    }

    if (nextType === 'ONE_WAY') {
      setValue('returnDate', '', { shouldValidate: false });
    } else if (nextType === 'ROUND_TRIP' && !current.returnDate) {
      setValue('returnDate', current.legs[1]?.departureDate ?? '', { shouldValidate: false });
    }
  };

  const swapMainAirports = () => {
    const currentOrigin = getValues('origin');
    const currentDestination = getValues('destination');
    setValue('origin', currentDestination, { shouldValidate: true });
    setValue('destination', currentOrigin, { shouldValidate: true });
  };

  const swapLegAirports = (index: number) => {
    const leg = getValues(`legs.${index}`);
    setValue(`legs.${index}.origin`, leg.destination, { shouldValidate: true });
    setValue(`legs.${index}.destination`, leg.origin, { shouldValidate: true });
  };

  const onSubmit = handleSubmit((values) => {
    onSearch(values as FlightSearchFormValues);
  });

  const maxChildren = Math.max(0, MAX_PASSENGERS - adults);
  const maxInfants = adults;

  return (
    <AppCard title="Where are you flying?">
      <Stack component="form" spacing={3} onSubmit={onSubmit} noValidate>
        <Controller
          name="tripType"
          control={control}
          render={({ field }) => (
            <TripTypeSelector
              value={field.value}
              disabled={disabled}
              onChange={handleTripTypeChange}
            />
          )}
        />

        {tripType === 'MULTI_CITY' ? (
          <Stack spacing={2}>
            {fields.map((field, index) => (
              <Box
                key={field.id}
                sx={{
                  p: { xs: 1.75, sm: 2.25 },
                  borderRadius: 2,
                  bgcolor: 'action.hover',
                }}
              >
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Flight {index + 1}
                  </Typography>
                  {fields.length > MIN_MULTI_CITY_LEGS ? (
                    <IconButton
                      aria-label={`Remove flight ${index + 1}`}
                      size="small"
                      onClick={() => remove(index)}
                    >
                      <Trash2 aria-hidden="true" size={16} />
                    </IconButton>
                  ) : null}
                </Stack>

                <Stack spacing={2}>
                  <Controller
                    name={`legs.${index}.origin`}
                    control={control}
                    render={({ field: originField }) => (
                      <Controller
                        name={`legs.${index}.destination`}
                        control={control}
                        render={({ field: destinationField }) => (
                          <AirportPairFields
                            originId={`flight-leg-${index}-origin`}
                            destinationId={`flight-leg-${index}-destination`}
                            origin={originField.value}
                            destination={destinationField.value}
                            originError={errors.legs?.[index]?.origin?.message}
                            destinationError={errors.legs?.[index]?.destination?.message}
                            onOriginChange={originField.onChange}
                            onDestinationChange={destinationField.onChange}
                            onSwap={() => swapLegAirports(index)}
                          />
                        )}
                      />
                    )}
                  />

                  <Box sx={{ maxWidth: { sm: 280 } }}>
                    <Controller
                      name={`legs.${index}.departureDate`}
                      control={control}
                      render={({ field }) => (
                        <FormField
                          id={`flight-leg-${index}-departure`}
                          label="Departure date"
                          required
                          errorMessage={errors.legs?.[index]?.departureDate?.message}
                        >
                          <AppInput
                            {...field}
                            type="date"
                            slotProps={{
                              inputLabel: { shrink: true },
                              htmlInput: {
                                min:
                                  index === 0
                                    ? minDate
                                    : getValues(`legs.${index - 1}.departureDate`) || minDate,
                              },
                            }}
                          />
                        </FormField>
                      )}
                    />
                  </Box>
                </Stack>
              </Box>
            ))}

            {errors.legs?.message || errors.legs?.root?.message ? (
              <AppAlert severity="error">
                {errors.legs.message ?? errors.legs.root?.message}
              </AppAlert>
            ) : null}

            {fields.length < MAX_MULTI_CITY_LEGS ? (
              <AppButton
                type="button"
                variant="outlined"
                startIcon={<Plus aria-hidden="true" size={16} />}
                onClick={() => {
                  const previousDate =
                    getValues(`legs.${fields.length - 1}.departureDate`) || minDate;
                  append(createEmptyLeg(previousDate));
                }}
                sx={{ alignSelf: 'flex-start' }}
              >
                Add flight
              </AppButton>
            ) : null}
          </Stack>
        ) : (
          <Stack spacing={2.5}>
            <AirportPairFields
              originId="flight-origin"
              destinationId="flight-destination"
              origin={origin}
              destination={destination}
              originError={errors.origin?.message}
              destinationError={errors.destination?.message}
              onOriginChange={(airport) =>
                setValue('origin', airport, { shouldValidate: true, shouldDirty: true })
              }
              onDestinationChange={(airport) =>
                setValue('destination', airport, { shouldValidate: true, shouldDirty: true })
              }
              onSwap={swapMainAirports}
            />

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{ alignItems: { sm: 'flex-start' } }}
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Controller
                  name="departureDate"
                  control={control}
                  render={({ field }) => (
                    <FormField
                      id="flight-departure-date"
                      label="Departure date"
                      required
                      errorMessage={errors.departureDate?.message}
                    >
                      <AppInput
                        {...field}
                        type="date"
                        slotProps={{
                          inputLabel: { shrink: true },
                          htmlInput: { min: minDate },
                        }}
                      />
                    </FormField>
                  )}
                />
              </Box>

              {tripType === 'ROUND_TRIP' ? (
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Controller
                    name="returnDate"
                    control={control}
                    render={({ field }) => (
                      <FormField
                        id="flight-return-date"
                        label="Return date"
                        required
                        errorMessage={errors.returnDate?.message}
                      >
                        <AppInput
                          {...field}
                          type="date"
                          slotProps={{
                            inputLabel: { shrink: true },
                            htmlInput: { min: departureDate || minDate },
                          }}
                        />
                      </FormField>
                    )}
                  />
                </Box>
              ) : null}

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Controller
                  name="cabinClass"
                  control={control}
                  render={({ field }) => (
                    <FormField
                      id="flight-cabin-class"
                      label="Cabin class"
                      required
                      errorMessage={errors.cabinClass?.message}
                    >
                      <AppSelect
                        id="flight-cabin-class"
                        label="Cabin class"
                        hideLabel
                        options={CABIN_CLASS_OPTIONS}
                        value={field.value}
                        onChange={(value) => field.onChange(value)}
                        onBlur={field.onBlur}
                        name={field.name}
                        inputRef={field.ref}
                      />
                    </FormField>
                  )}
                />
              </Box>
            </Stack>
          </Stack>
        )}

        {tripType === 'MULTI_CITY' ? (
          <Box sx={{ maxWidth: { sm: 320 } }}>
            <Controller
              name="cabinClass"
              control={control}
              render={({ field }) => (
                <FormField
                  id="flight-cabin-class-multi"
                  label="Cabin class"
                  required
                  errorMessage={errors.cabinClass?.message}
                >
                  <AppSelect
                    id="flight-cabin-class-multi"
                    label="Cabin class"
                    hideLabel
                    options={CABIN_CLASS_OPTIONS}
                    value={field.value}
                    onChange={(value) => field.onChange(value)}
                    onBlur={field.onBlur}
                    name={field.name}
                    inputRef={field.ref}
                  />
                </FormField>
              )}
            />
          </Box>
        ) : null}

        <Box
          sx={{
            p: { xs: 1.75, sm: 2 },
            borderRadius: 2,
            bgcolor: 'action.hover',
            width: { xs: '100%', sm: '50%' },
            maxWidth: { sm: '50%' },
          }}
        >
          <Typography variant="subtitle2" sx={{ mb: 1.75, fontWeight: 700 }}>
            Passengers
          </Typography>
          <Stack spacing={1.75} divider={<Divider flexItem />}>
            <Controller
              name="adults"
              control={control}
              render={({ field }) => (
                <PassengerCountControl
                  id="flight-adults"
                  label="Adults"
                  description="12+ years"
                  value={field.value}
                  min={MIN_ADULTS}
                  max={MAX_PASSENGERS - children}
                  errorMessage={errors.adults?.message}
                  onChange={(value) => {
                    field.onChange(value);
                    if (infants > value) {
                      setValue('infants', value, { shouldValidate: true });
                    }
                  }}
                />
              )}
            />
            <Controller
              name="children"
              control={control}
              render={({ field }) => (
                <PassengerCountControl
                  id="flight-children"
                  label="Children"
                  description="2–11 years"
                  value={field.value}
                  min={0}
                  max={maxChildren}
                  errorMessage={errors.children?.message}
                  onChange={field.onChange}
                />
              )}
            />
            <Controller
              name="infants"
              control={control}
              render={({ field }) => (
                <PassengerCountControl
                  id="flight-infants"
                  label="Infants"
                  description="Under 2 years"
                  value={field.value}
                  min={0}
                  max={maxInfants}
                  errorMessage={errors.infants?.message}
                  onChange={field.onChange}
                />
              )}
            />
          </Stack>
        </Box>

        <AppButton
          type="submit"
          variant="contained"
          size="large"
          disabled={disabled}
          sx={{
            alignSelf: { xs: 'stretch', sm: 'flex-start' },
            minWidth: { sm: 200 },
            px: 3,
          }}
        >
          Search flights
        </AppButton>
      </Stack>
    </AppCard>
  );
}
