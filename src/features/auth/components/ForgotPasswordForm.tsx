import Stack from '@mui/material/Stack';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { AppAlert } from '@/components/common/AppAlert';
import { AppButton } from '@/components/common/AppButton';
import { AppInput } from '@/components/common/AppInput';
import { FormField } from '@/components/forms/FormField';
import { useAuth } from '../hooks/useAuth';
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '../schemas';

export interface ForgotPasswordFormProps {
  onSuccess?: (message: string) => void | Promise<void>;
}

export function ForgotPasswordForm({ onSuccess }: ForgotPasswordFormProps) {
  const { forgotPassword, isSubmitting, error, clearError } = useAuth();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    clearError();
    try {
      const message = await forgotPassword(values);
      await onSuccess?.(message);
    } catch {
      // Error message is stored on the auth store for display.
    }
  });

  return (
    <Stack component="form" spacing={2.5} onSubmit={onSubmit} noValidate>
      {error ? (
        <AppAlert severity="error" title="Request failed">
          {error}
        </AppAlert>
      ) : null}

      <Controller
        name="email"
        control={control}
        render={({ field }) => (
          <FormField
            id="forgot-password-email"
            label="Email"
            required
            helperText="We will send reset instructions if an account exists."
            errorMessage={errors.email?.message}
          >
            <AppInput {...field} type="email" autoComplete="email" />
          </FormField>
        )}
      />

      <AppButton type="submit" variant="contained" size="large" loading={isSubmitting}>
        Send reset link
      </AppButton>
    </Stack>
  );
}
