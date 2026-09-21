import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo } from 'react';
import {
  FormProvider,
  useFieldArray,
  useForm,
  useWatch,
  type Resolver,
} from 'react-hook-form';
import { AppAlert, AppButton, AppCard } from '@/components/common';
import { createPassengersFormSchema } from '../schemas/passengerSchema';
import { usePassengerDraftStore } from '../store/passengerDraftStore';
import type { PassengerCounts, PassengersFormValues } from '../types/passenger';
import { createPassengerSlots } from '../utils/createPassengerSlots';
import { PassengerFields } from './PassengerFields';

export interface PassengerFormProps {
  counts: PassengerCounts;
  departureDate: string;
  requiresPassport: boolean;
  onSaved?: () => void;
}

function displayIndexFor(
  passengers: PassengersFormValues['passengers'] | undefined,
  index: number,
): number {
  const list = passengers ?? [];
  const type = list[index]?.type;
  if (!type) {
    return index + 1;
  }
  return list.slice(0, index + 1).filter((passenger) => passenger.type === type).length;
}

export function PassengerForm({
  counts,
  departureDate,
  requiresPassport,
  onSaved,
}: PassengerFormProps) {
  const storedPassengers = usePassengerDraftStore((state) => state.passengers);
  const saveStatus = usePassengerDraftStore((state) => state.saveStatus);
  const saveError = usePassengerDraftStore((state) => state.saveError);
  const saveDraft = usePassengerDraftStore((state) => state.saveDraft);
  const setPassengers = usePassengerDraftStore((state) => state.setPassengers);
  const clearSaveStatus = usePassengerDraftStore((state) => state.clearSaveStatus);

  const schema = useMemo(
    () =>
      createPassengersFormSchema({
        requiresPassport,
        departureDate,
        expectedCounts: counts,
      }),
    [counts, departureDate, requiresPassport],
  );

  const defaultPassengers =
    storedPassengers.length > 0 ? storedPassengers : createPassengerSlots(counts);

  const methods = useForm<PassengersFormValues>({
    resolver: zodResolver(schema) as Resolver<PassengersFormValues>,
    defaultValues: { passengers: defaultPassengers },
    mode: 'onBlur',
  });

  const { control, handleSubmit, formState, reset, setError } = methods;
  const { fields } = useFieldArray({
    control,
    name: 'passengers',
    keyName: 'fieldKey',
  });

  const watchedPassengers = useWatch({ control, name: 'passengers' });

  useEffect(() => {
    const next =
      storedPassengers.length > 0 ? storedPassengers : createPassengerSlots(counts);
    reset({ passengers: next });
    // Reset only when the trip shape changes, not on every draft write.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- trip-scoped
  }, [
    counts.adults,
    counts.children,
    counts.infants,
    departureDate,
    requiresPassport,
    reset,
  ]);

  const adultOptions = useMemo(() => {
    const list = watchedPassengers ?? [];
    return list
      .filter((passenger) => passenger.type === 'ADULT')
      .map((passenger, adultIndex) => {
        const name = `${passenger.firstName} ${passenger.lastName}`.trim();
        return {
          value: passenger.id,
          label: name || `Adult ${adultIndex + 1}`,
        };
      });
  }, [watchedPassengers]);

  const onSubmit = handleSubmit((values) => {
    clearSaveStatus();
    const result = saveDraft(values as PassengersFormValues);
    if (!result.ok) {
      setError('root', { message: result.message });
      return;
    }
    onSaved?.();
  });

  const passengersArrayError =
    formState.errors.passengers &&
    !Array.isArray(formState.errors.passengers) &&
    typeof formState.errors.passengers.message === 'string'
      ? formState.errors.passengers.message
      : undefined;

  const rootError = formState.errors.root?.message || passengersArrayError || saveError;

  return (
    <FormProvider {...methods}>
      <Stack component="form" spacing={2.5} onSubmit={onSubmit} noValidate>
        {requiresPassport ? (
          <AppAlert severity="info" title="International flight">
            Passport number and expiry are required for every passenger. Passports must remain valid
            for at least 6 months after departure.
          </AppAlert>
        ) : (
          <AppAlert severity="info" title="Domestic flight">
            Passport details are optional for this route.
          </AppAlert>
        )}

        {saveStatus === 'saved' ? (
          <AppAlert severity="success" title="Passengers saved" onClose={clearSaveStatus}>
            Traveler details were saved for this booking. You can continue or edit them anytime.
          </AppAlert>
        ) : null}

        {rootError ? (
          <AppAlert severity="error" title="Unable to save passengers" onClose={clearSaveStatus}>
            {rootError}
          </AppAlert>
        ) : null}

        {fields.map((field, index) => (
          <AppCard
            key={field.fieldKey}
            outlined
            sx={{
              '& .MuiCardContent-root': {
                p: { xs: 2, sm: 2.5 },
                '&:last-child': { pb: { xs: 2, sm: 2.5 } },
              },
            }}
          >
            <PassengerFields
              index={index}
              displayIndex={displayIndexFor(watchedPassengers, index)}
              requiresPassport={requiresPassport}
              departureDate={departureDate}
              adultOptions={adultOptions}
            />
          </AppCard>
        ))}

        <Divider />

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          sx={{
            justifyContent: { xs: 'center', sm: 'space-between' },
            alignItems: { xs: 'center', sm: 'center' },
            textAlign: { xs: 'center', sm: 'left' },
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Total passengers:{' '}
            {counts.adults} adult{counts.adults === 1 ? '' : 's'}
            {counts.children > 0
              ? ` · ${counts.children} child${counts.children === 1 ? '' : 'ren'}`
              : ''}
            {counts.infants > 0
              ? ` · ${counts.infants} infant${counts.infants === 1 ? '' : 's'}`
              : ''}
          </Typography>

          <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'center' }}>
            <AppButton
              type="button"
              variant="outlined"
              onClick={() => {
                setPassengers(methods.getValues().passengers);
                clearSaveStatus();
              }}
            >
              Save draft
            </AppButton>
            <AppButton type="submit" variant="contained" loading={formState.isSubmitting}>
              Save passengers
            </AppButton>
          </Stack>
        </Stack>
      </Stack>
    </FormProvider>
  );
}
