import Stack from '@mui/material/Stack';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { AppAlert } from '@/components/common/AppAlert';
import { AppButton } from '@/components/common/AppButton';
import { AppInput } from '@/components/common/AppInput';
import { FormField } from '@/components/forms/FormField';
import { useAuth } from '../hooks/useAuth';
import { verifyEmailSchema, type VerifyEmailFormValues } from '../schemas';

export interface VerifyEmailFormProps {
  defaultToken?: string;
  onSuccess?: (message: string) => void | Promise<void>;
}

export function VerifyEmailForm({ defaultToken = '', onSuccess }: VerifyEmailFormProps) {
  const { verifyEmail, isSubmitting, error, clearError } = useAuth();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyEmailFormValues>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: { token: defaultToken },
  });

  const onSubmit = handleSubmit(async (values) => {
    clearError();
    try {
      const message = await verifyEmail(values);
      await onSuccess?.(message);
    } catch {
      // Error message is stored on the auth store for display.
    }
  });

  return (
    <Stack component="form" spacing={2.5} onSubmit={onSubmit} noValidate>
      {error ? (
        <AppAlert severity="error" title="Verification failed">
          {error}
        </AppAlert>
      ) : null}

      <Controller
        name="token"
        control={control}
        render={({ field }) => (
          <FormField
            id="verify-email-token"
            label="Verification token"
            required
            errorMessage={errors.token?.message}
          >
            <AppInput {...field} autoComplete="off" />
          </FormField>
        )}
      />

      <AppButton type="submit" variant="contained" size="large" loading={isSubmitting}>
        Verify email
      </AppButton>
    </Stack>
  );
}
