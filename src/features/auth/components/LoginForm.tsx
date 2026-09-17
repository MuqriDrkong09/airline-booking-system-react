import Stack from '@mui/material/Stack';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { AppAlert } from '@/components/common/AppAlert';
import { AppButton } from '@/components/common/AppButton';
import { AppInput } from '@/components/common/AppInput';
import { FormField } from '@/components/forms/FormField';
import type { AuthUser } from '@/types/auth';
import { useAuth } from '../hooks/useAuth';
import { loginSchema, type LoginFormValues } from '../schemas';

export interface LoginFormProps {
  onSuccess?: (user: AuthUser) => void | Promise<void>;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const { login, isSubmitting, error, clearError } = useAuth();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    clearError();
    try {
      const user = await login(values);
      await onSuccess?.(user);
    } catch {
      // Error message is stored on the auth store for display.
    }
  });

  return (
    <Stack component="form" spacing={2.5} onSubmit={onSubmit} noValidate>
      {error ? (
        <AppAlert severity="error" title="Sign in failed">
          {error}
        </AppAlert>
      ) : null}

      <Controller
        name="email"
        control={control}
        render={({ field }) => (
          <FormField id="login-email" label="Email" required errorMessage={errors.email?.message}>
            <AppInput
              {...field}
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
            />
          </FormField>
        )}
      />

      <Controller
        name="password"
        control={control}
        render={({ field }) => (
          <FormField
            id="login-password"
            label="Password"
            required
            errorMessage={errors.password?.message}
          >
            <AppInput {...field} type="password" autoComplete="current-password" />
          </FormField>
        )}
      />

      <AppButton type="submit" variant="contained" size="large" loading={isSubmitting}>
        Sign in
      </AppButton>
    </Stack>
  );
}
