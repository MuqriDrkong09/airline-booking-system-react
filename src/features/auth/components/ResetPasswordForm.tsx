import Stack from '@mui/material/Stack';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { AppAlert } from '@/components/common/AppAlert';
import { AppButton } from '@/components/common/AppButton';
import { AppInput } from '@/components/common/AppInput';
import { FormField } from '@/components/forms/FormField';
import { useAuth } from '../hooks/useAuth';
import { resetPasswordSchema, type ResetPasswordFormValues } from '../schemas';

export interface ResetPasswordFormProps {
  defaultToken?: string;
  onSuccess?: (message: string) => void | Promise<void>;
}

export function ResetPasswordForm({ defaultToken = '', onSuccess }: ResetPasswordFormProps) {
  const { resetPassword, isSubmitting, error, clearError } = useAuth();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: defaultToken,
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    clearError();
    try {
      const message = await resetPassword(values);
      await onSuccess?.(message);
    } catch {
      // Error message is stored on the auth store for display.
    }
  });

  return (
    <Stack component="form" spacing={2.5} onSubmit={onSubmit} noValidate>
      {error ? (
        <AppAlert severity="error" title="Reset failed">
          {error}
        </AppAlert>
      ) : null}

      <Controller
        name="token"
        control={control}
        render={({ field }) => (
          <FormField
            id="reset-password-token"
            label="Reset token"
            required
            errorMessage={errors.token?.message}
          >
            <AppInput {...field} autoComplete="off" />
          </FormField>
        )}
      />

      <Controller
        name="password"
        control={control}
        render={({ field }) => (
          <FormField
            id="reset-password"
            label="New password"
            required
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
            id="reset-confirm-password"
            label="Confirm new password"
            required
            errorMessage={errors.confirmPassword?.message}
          >
            <AppInput {...field} type="password" autoComplete="new-password" />
          </FormField>
        )}
      />

      <AppButton type="submit" variant="contained" size="large" loading={isSubmitting}>
        Reset password
      </AppButton>
    </Stack>
  );
}
