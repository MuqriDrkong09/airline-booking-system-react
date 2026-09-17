import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { AppAlert } from '@/components/common/AppAlert';
import { AppButton } from '@/components/common/AppButton';
import { AppInput } from '@/components/common/AppInput';
import { AppSelect } from '@/components/common/AppSelect';
import { FormField } from '@/components/forms/FormField';
import { NATIONALITIES, USER_TITLES } from '@/constants/registration';
import type { AuthUser } from '@/types/auth';
import {
  CABIN_PREFERENCES,
  DEFAULT_TRAVEL_PREFERENCES,
  MEAL_PREFERENCES,
  SEAT_PREFERENCES,
  type UpdateProfileRequest,
} from '@/types/profile';
import {
  getMutationErrorMessage,
  useUpdateProfileMutation,
} from '../hooks/useProfile';
import { updateProfileSchema, type UpdateProfileFormValues } from '../schemas';

export interface ProfileEditFormProps {
  user: AuthUser;
  onSuccess?: (message: string) => void;
  onCancel?: () => void;
}

const fieldColumnSx = {
  flex: { sm: '1 1 0' },
  minWidth: 0,
  width: { xs: '100%', sm: 'auto' },
} as const;

function toFormValues(user: AuthUser): UpdateProfileFormValues {
  const preferences = user.travelPreferences ?? DEFAULT_TRAVEL_PREFERENCES;

  return {
    title: user.title ?? '',
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone ?? '',
    dateOfBirth: user.dateOfBirth ?? '',
    nationality: user.nationality ?? '',
    preferredCabin: preferences.preferredCabin,
    seatPreference: preferences.seatPreference,
    mealPreference: preferences.mealPreference,
    newsletterOptIn: preferences.newsletterOptIn,
  };
}

function getMaxDateOfBirth(): string {
  const today = new Date();
  const max = new Date(Date.UTC(today.getUTCFullYear() - 18, today.getUTCMonth(), today.getUTCDate()));
  return max.toISOString().slice(0, 10);
}

export function ProfileEditForm({ user, onSuccess, onCancel }: ProfileEditFormProps) {
  const updateProfile = useUpdateProfileMutation();
  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: toFormValues(user),
  });

  const onSubmit = handleSubmit(async (values) => {
    const payload: UpdateProfileRequest = {
      title: values.title,
      firstName: values.firstName,
      lastName: values.lastName,
      phone: values.phone,
      dateOfBirth: values.dateOfBirth,
      nationality: values.nationality,
      travelPreferences: {
        preferredCabin: values.preferredCabin,
        seatPreference: values.seatPreference,
        mealPreference: values.mealPreference,
        newsletterOptIn: values.newsletterOptIn,
      },
    };

    try {
      const updated = await updateProfile.mutateAsync(payload);
      reset(toFormValues(updated));
      onSuccess?.('Profile updated successfully.');
    } catch {
      // Error is shown from mutation state.
    }
  });

  const errorMessage = updateProfile.error
    ? getMutationErrorMessage(updateProfile.error, 'Unable to update profile.')
    : null;

  return (
    <Stack component="form" spacing={2.5} onSubmit={onSubmit} noValidate>
      {errorMessage ? (
        <AppAlert severity="error" title="Save failed">
          {errorMessage}
        </AppAlert>
      ) : null}

      <Controller
        name="title"
        control={control}
        render={({ field }) => (
          <FormField id="profile-title" label="Title" required errorMessage={errors.title?.message}>
            <AppSelect
              id="profile-title"
              label="Title"
              hideLabel
              required
              value={field.value}
              options={USER_TITLES.map((item) => ({ value: item.value, label: item.label }))}
              error={Boolean(errors.title)}
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
            name="firstName"
            control={control}
            render={({ field }) => (
              <FormField
                id="profile-first-name"
                label="First name"
                required
                errorMessage={errors.firstName?.message}
              >
                <AppInput {...field} autoComplete="given-name" />
              </FormField>
            )}
          />
        </Box>
        <Box sx={fieldColumnSx}>
          <Controller
            name="lastName"
            control={control}
            render={({ field }) => (
              <FormField
                id="profile-last-name"
                label="Last name"
                required
                errorMessage={errors.lastName?.message}
              >
                <AppInput {...field} autoComplete="family-name" />
              </FormField>
            )}
          />
        </Box>
      </Stack>

      <Controller
        name="phone"
        control={control}
        render={({ field }) => (
          <FormField id="profile-phone" label="Phone" required errorMessage={errors.phone?.message}>
            <AppInput {...field} type="tel" autoComplete="tel" />
          </FormField>
        )}
      />

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: 'flex-start' }}>
        <Box sx={fieldColumnSx}>
          <Controller
            name="dateOfBirth"
            control={control}
            render={({ field }) => (
              <FormField
                id="profile-date-of-birth"
                label="Date of birth"
                required
                errorMessage={errors.dateOfBirth?.message}
              >
                <AppInput
                  {...field}
                  type="date"
                  autoComplete="bday"
                  slotProps={{
                    inputLabel: { shrink: true },
                    htmlInput: { max: getMaxDateOfBirth() },
                  }}
                />
              </FormField>
            )}
          />
        </Box>
        <Box sx={fieldColumnSx}>
          <Controller
            name="nationality"
            control={control}
            render={({ field }) => (
              <FormField
                id="profile-nationality"
                label="Nationality"
                required
                errorMessage={errors.nationality?.message}
              >
                <AppSelect
                  id="profile-nationality"
                  label="Nationality"
                  hideLabel
                  required
                  value={field.value}
                  options={NATIONALITIES.map((item) => ({
                    value: item.value,
                    label: item.label,
                  }))}
                  error={Boolean(errors.nationality)}
                  onChange={(value) => field.onChange(value)}
                  onBlur={field.onBlur}
                  name={field.name}
                />
              </FormField>
            )}
          />
        </Box>
      </Stack>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <Box sx={fieldColumnSx}>
          <Controller
            name="preferredCabin"
            control={control}
            render={({ field }) => (
              <FormField
                id="profile-preferred-cabin"
                label="Preferred cabin"
                required
                errorMessage={errors.preferredCabin?.message}
              >
                <AppSelect
                  id="profile-preferred-cabin"
                  label="Preferred cabin"
                  hideLabel
                  required
                  value={field.value}
                  options={CABIN_PREFERENCES.map((item) => ({
                    value: item.value,
                    label: item.label,
                  }))}
                  error={Boolean(errors.preferredCabin)}
                  onChange={(value) => field.onChange(value)}
                  onBlur={field.onBlur}
                  name={field.name}
                />
              </FormField>
            )}
          />
        </Box>
        <Box sx={fieldColumnSx}>
          <Controller
            name="seatPreference"
            control={control}
            render={({ field }) => (
              <FormField
                id="profile-seat-preference"
                label="Seat preference"
                required
                errorMessage={errors.seatPreference?.message}
              >
                <AppSelect
                  id="profile-seat-preference"
                  label="Seat preference"
                  hideLabel
                  required
                  value={field.value}
                  options={SEAT_PREFERENCES.map((item) => ({
                    value: item.value,
                    label: item.label,
                  }))}
                  error={Boolean(errors.seatPreference)}
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
        name="mealPreference"
        control={control}
        render={({ field }) => (
          <FormField
            id="profile-meal-preference"
            label="Meal preference"
            required
            errorMessage={errors.mealPreference?.message}
          >
            <AppSelect
              id="profile-meal-preference"
              label="Meal preference"
              hideLabel
              required
              value={field.value}
              options={MEAL_PREFERENCES.map((item) => ({
                value: item.value,
                label: item.label,
              }))}
              error={Boolean(errors.mealPreference)}
              onChange={(value) => field.onChange(value)}
              onBlur={field.onBlur}
              name={field.name}
            />
          </FormField>
        )}
      />

      <Controller
        name="newsletterOptIn"
        control={control}
        render={({ field }) => (
          <FormControlLabel
            control={
              <Checkbox
                checked={field.value}
                onChange={(event) => field.onChange(event.target.checked)}
                onBlur={field.onBlur}
                name={field.name}
              />
            }
            label="Send me travel deals and trip reminders"
          />
        )}
      />

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ pt: 1 }}>
        <AppButton
          type="submit"
          variant="contained"
          loading={updateProfile.isPending}
          disabled={!isDirty || updateProfile.isPending}
        >
          Save changes
        </AppButton>
        {onCancel ? (
          <AppButton type="button" variant="outlined" onClick={onCancel} disabled={updateProfile.isPending}>
            Cancel
          </AppButton>
        ) : null}
      </Stack>
    </Stack>
  );
}
