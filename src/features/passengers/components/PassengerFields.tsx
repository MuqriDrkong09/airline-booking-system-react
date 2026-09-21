import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { AppInput, AppSelect } from '@/components/common';
import { FormField } from '@/components/forms/FormField';
import { NATIONALITIES, USER_TITLES } from '@/constants/registration';
import {
  GENDERS,
  PASSENGER_TYPE_HINTS,
  PASSENGER_TYPE_LABELS,
  type PassengerType,
} from '../constants/passenger';
import type { PassengersFormValues } from '../types/passenger';
import { todayIsoDate } from '../utils/age';

const TITLE_OPTIONS = USER_TITLES.map((title) => ({
  value: title.value,
  label: title.label,
}));

const GENDER_OPTIONS = GENDERS.map((gender) => ({
  value: gender.value,
  label: gender.label,
}));

const NATIONALITY_OPTIONS = NATIONALITIES.map((item) => ({
  value: item.value,
  label: item.label,
}));

const fieldColumnSx = {
  flex: { sm: '1 1 0' },
  minWidth: 0,
  width: { xs: '100%', sm: 'auto' },
} as const;

export interface PassengerFieldsProps {
  index: number;
  displayIndex: number;
  requiresPassport: boolean;
  departureDate: string;
  adultOptions: Array<{ value: string; label: string }>;
}

export function PassengerFields({
  index,
  displayIndex,
  requiresPassport,
  departureDate,
  adultOptions,
}: PassengerFieldsProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext<PassengersFormValues>();

  const type = useWatch({ control, name: `passengers.${index}.type` }) as PassengerType;
  const fieldErrors = errors.passengers?.[index];
  const maxDob = departureDate || todayIsoDate();
  const needsContact = type === 'ADULT';
  const showAssociation = type === 'INFANT';

  return (
    <Stack spacing={2}>
      <Stack spacing={0.25}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          {PASSENGER_TYPE_LABELS[type]} {displayIndex}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {PASSENGER_TYPE_HINTS[type]}
        </Typography>
      </Stack>

      <Controller
        name={`passengers.${index}.title`}
        control={control}
        render={({ field }) => (
          <FormField
            id={`passenger-${index}-title`}
            label="Title"
            required
            errorMessage={fieldErrors?.title?.message}
          >
            <AppSelect
              id={`passenger-${index}-title`}
              label="Title"
              hideLabel
              required
              value={field.value}
              options={TITLE_OPTIONS}
              error={Boolean(fieldErrors?.title)}
              onChange={(value) => field.onChange(value)}
              onBlur={field.onBlur}
              name={field.name}
            />
          </FormField>
        )}
      />

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <Box sx={fieldColumnSx}>
          <Controller
            name={`passengers.${index}.firstName`}
            control={control}
            render={({ field }) => (
              <FormField
                id={`passenger-${index}-first-name`}
                label="First name"
                required
                errorMessage={fieldErrors?.firstName?.message}
              >
                <AppInput {...field} autoComplete="given-name" />
              </FormField>
            )}
          />
        </Box>
        <Box sx={fieldColumnSx}>
          <Controller
            name={`passengers.${index}.lastName`}
            control={control}
            render={({ field }) => (
              <FormField
                id={`passenger-${index}-last-name`}
                label="Last name"
                required
                errorMessage={fieldErrors?.lastName?.message}
              >
                <AppInput {...field} autoComplete="family-name" />
              </FormField>
            )}
          />
        </Box>
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <Box sx={fieldColumnSx}>
          <Controller
            name={`passengers.${index}.dateOfBirth`}
            control={control}
            render={({ field }) => (
              <FormField
                id={`passenger-${index}-dob`}
                label="Date of birth"
                required
                errorMessage={fieldErrors?.dateOfBirth?.message}
              >
                <AppInput
                  {...field}
                  type="date"
                  autoComplete="bday"
                  slotProps={{
                    inputLabel: { shrink: true },
                    htmlInput: { max: maxDob },
                  }}
                />
              </FormField>
            )}
          />
        </Box>
        <Box sx={fieldColumnSx}>
          <Controller
            name={`passengers.${index}.gender`}
            control={control}
            render={({ field }) => (
              <FormField
                id={`passenger-${index}-gender`}
                label="Gender"
                required
                errorMessage={fieldErrors?.gender?.message}
              >
                <AppSelect
                  id={`passenger-${index}-gender`}
                  label="Gender"
                  hideLabel
                  required
                  value={field.value}
                  options={GENDER_OPTIONS}
                  error={Boolean(fieldErrors?.gender)}
                  onChange={(value) => field.onChange(value)}
                  onBlur={field.onBlur}
                  name={field.name}
                />
              </FormField>
            )}
          />
        </Box>
      </Stack>

      <Controller
        name={`passengers.${index}.nationality`}
        control={control}
        render={({ field }) => (
          <FormField
            id={`passenger-${index}-nationality`}
            label="Nationality"
            required
            errorMessage={fieldErrors?.nationality?.message}
          >
            <AppSelect
              id={`passenger-${index}-nationality`}
              label="Nationality"
              hideLabel
              required
              value={field.value}
              options={NATIONALITY_OPTIONS}
              error={Boolean(fieldErrors?.nationality)}
              onChange={(value) => field.onChange(value)}
              onBlur={field.onBlur}
              name={field.name}
            />
          </FormField>
        )}
      />

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <Box sx={fieldColumnSx}>
          <Controller
            name={`passengers.${index}.passportNumber`}
            control={control}
            render={({ field }) => (
              <FormField
                id={`passenger-${index}-passport-number`}
                label="Passport number"
                required={requiresPassport}
                helperText={
                  requiresPassport
                    ? 'Required for international flights'
                    : 'Optional for this domestic route'
                }
                errorMessage={fieldErrors?.passportNumber?.message}
              >
                <AppInput {...field} autoComplete="off" />
              </FormField>
            )}
          />
        </Box>
        <Box sx={fieldColumnSx}>
          <Controller
            name={`passengers.${index}.passportExpiry`}
            control={control}
            render={({ field }) => (
              <FormField
                id={`passenger-${index}-passport-expiry`}
                label="Passport expiry"
                required={requiresPassport}
                errorMessage={fieldErrors?.passportExpiry?.message}
              >
                <AppInput
                  {...field}
                  type="date"
                  slotProps={{
                    inputLabel: { shrink: true },
                    htmlInput: { min: departureDate || todayIsoDate() },
                  }}
                />
              </FormField>
            )}
          />
        </Box>
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <Box sx={fieldColumnSx}>
          <Controller
            name={`passengers.${index}.email`}
            control={control}
            render={({ field }) => (
              <FormField
                id={`passenger-${index}-email`}
                label="Email"
                required={needsContact}
                helperText={needsContact ? undefined : 'Optional for children and infants'}
                errorMessage={fieldErrors?.email?.message}
              >
                <AppInput {...field} type="email" autoComplete="email" />
              </FormField>
            )}
          />
        </Box>
        <Box sx={fieldColumnSx}>
          <Controller
            name={`passengers.${index}.phone`}
            control={control}
            render={({ field }) => (
              <FormField
                id={`passenger-${index}-phone`}
                label="Phone"
                required={needsContact}
                helperText={
                  needsContact
                    ? 'Include country code when possible, e.g. +60 12 345 6789'
                    : 'Optional for children and infants'
                }
                errorMessage={fieldErrors?.phone?.message}
              >
                <AppInput
                  {...field}
                  type="tel"
                  autoComplete="tel"
                  placeholder="+60 12 345 6789"
                />
              </FormField>
            )}
          />
        </Box>
      </Stack>

      {showAssociation ? (
        <Controller
          name={`passengers.${index}.associatedAdultId`}
          control={control}
          render={({ field }) => (
            <FormField
              id={`passenger-${index}-associated-adult`}
              label="Traveling with adult"
              required
              helperText="Infants must sit with an accompanying adult"
              errorMessage={fieldErrors?.associatedAdultId?.message}
            >
              <AppSelect
                id={`passenger-${index}-associated-adult`}
                label="Traveling with adult"
                hideLabel
                required
                value={field.value}
                options={adultOptions}
                error={Boolean(fieldErrors?.associatedAdultId)}
                onChange={(value) => field.onChange(value)}
                onBlur={field.onBlur}
                name={field.name}
              />
            </FormField>
          )}
        />
      ) : null}
    </Stack>
  );
}
