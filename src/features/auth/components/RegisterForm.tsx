import Stack from '@mui/material/Stack';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { AppAlert } from '@/components/common/AppAlert';
import { AppButton } from '@/components/common/AppButton';
import { AppInput } from '@/components/common/AppInput';
import { FormField } from '@/components/forms/FormField';
import { useAuth } from '../hooks/useAuth';
import { registerSchema, type RegisterFormValues } from '../schemas';

export interface RegisterFormProps {
  onSuccess?: (message: string) => void | Promise<void>;
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
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    clearError();
    try {
      const message = await register(values);
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

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
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
        name="password"
        control={control}
        render={({ field }) => (
          <FormField
            id="register-password"
            label="Password"
            required
            helperText="At least 8 characters with upper, lower, and a number."
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

      <AppButton type="submit" variant="contained" size="large" loading={isSubmitting}>
        Create account
      </AppButton>
    </Stack>
  );
}
