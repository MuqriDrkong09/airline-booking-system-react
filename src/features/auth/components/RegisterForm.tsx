import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { AppAlert } from '@/components/common/AppAlert';
import { AppButton } from '@/components/common/AppButton';
import { AppInput } from '@/components/common/AppInput';
import { AppSelect } from '@/components/common/AppSelect';
import { FormField } from '@/components/forms/FormField';
import { NATIONALITIES, USER_TITLES } from '@/constants/registration';
import type { RegisterRequest, UserTitle } from '@/types/auth';
import { useAuth } from '../hooks/useAuth';
import { registerSchema, type RegisterFormValues } from '../schemas';

export interface RegisterFormProps {
  onSuccess?: (message: string) => void | Promise<void>;
}

const TITLE_OPTIONS = USER_TITLES.map((title) => ({
  value: title.value,
  label: title.label,
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

function getMaxDateOfBirth(): string {
  const today = new Date();
  const max = new Date(Date.UTC(today.getUTCFullYear() - 18, today.getUTCMonth(), today.getUTCDate()));
  return max.toISOString().slice(0, 10);
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const { register, isSubmitting, error, clearError } = useAuth();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      title: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      dateOfBirth: '',
      nationality: '',
      termsAccepted: false,
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    clearError();
    try {
      const payload: RegisterRequest = {
        ...values,
        title: values.title as UserTitle,
      };
      const message = await register(payload);
      await onSuccess?.(message);
    } catch {
      // Error message is stored on the auth store for display.
    }
  });

  return (
    <Stack component="form" spacing={2.5} onSubmit={onSubmit} noValidate>
      {error ? (
        <AppAlert severity="error" title="Registration failed">
          {error}
        </AppAlert>
      ) : null}

      <Controller
        name="title"
        control={control}
        render={({ field }) => (
          <FormField
            id="register-title"
            label="Title"
            required
            errorMessage={errors.title?.message}
          >
            <AppSelect
              id="register-title"
              label="Title"
              hideLabel
              required
              value={field.value}
              options={TITLE_OPTIONS}
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
                id="register-first-name"
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
                id="register-last-name"
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
        name="email"
        control={control}
        render={({ field }) => (
          <FormField
            id="register-email"
            label="Email"
            required
            errorMessage={errors.email?.message}
          >
            <AppInput {...field} type="email" autoComplete="email" />
          </FormField>
        )}
      />

      <Controller
        name="phone"
        control={control}
        render={({ field }) => (
          <FormField
            id="register-phone"
            label="Phone"
            required
            helperText="Include country code when possible, e.g. +60 12 345 6789"
            errorMessage={errors.phone?.message}
          >
            <AppInput {...field} type="tel" autoComplete="tel" placeholder="+60 12 345 6789" />
          </FormField>
        )}
      />

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-start">
        <Box sx={fieldColumnSx}>
          <Controller
            name="dateOfBirth"
            control={control}
            render={({ field }) => (
              <FormField
                id="register-date-of-birth"
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
                id="register-nationality"
                label="Nationality"
                required
                errorMessage={errors.nationality?.message}
              >
                <AppSelect
                  id="register-nationality"
                  label="Nationality"
                  hideLabel
                  required
                  value={field.value}
                  options={NATIONALITY_OPTIONS}
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

      <Controller
        name="password"
        control={control}
        render={({ field }) => (
          <FormField
            id="register-password"
            label="Password"
            required
            helperText="At least 8 characters with upper, lower, number, and special character."
            errorMessage={errors.password?.message}
          >
            <AppInput {...field} type="password" autoComplete="new-password" />
          </FormField>
        )}
      />

      <Controller
        name="confirmPassword"
        control={control}
        render={({ field }) => (
          <FormField
            id="register-confirm-password"
            label="Confirm password"
            required
            errorMessage={errors.confirmPassword?.message}
          >
            <AppInput {...field} type="password" autoComplete="new-password" />
          </FormField>
        )}
      />

      <Controller
        name="termsAccepted"
        control={control}
        render={({ field }) => (
          <FormControl error={Boolean(errors.termsAccepted)} required>
            <FormControlLabel
              control={
                <Checkbox
                  checked={field.value}
                  onChange={(event) => field.onChange(event.target.checked)}
                  onBlur={field.onBlur}
                  name={field.name}
                  slotProps={{
                    input: { 'aria-describedby': 'register-terms-helper' },
                  }}
                />              }
              label={
                <Typography variant="body2">
                  I accept the terms and conditions and privacy policy
                </Typography>
              }
            />
            {errors.termsAccepted ? (
              <FormHelperText id="register-terms-helper">
                {errors.termsAccepted.message}
              </FormHelperText>
            ) : (
              <FormHelperText id="register-terms-helper">
                Required to create an AeroBook account.
              </FormHelperText>
            )}
          </FormControl>
        )}
      />

      <AppButton type="submit" variant="contained" size="large" loading={isSubmitting}>
        Create account
      </AppButton>
    </Stack>
  );
}
