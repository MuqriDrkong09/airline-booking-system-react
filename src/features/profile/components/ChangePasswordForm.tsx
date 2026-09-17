import Stack from '@mui/material/Stack';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { AppAlert } from '@/components/common/AppAlert';
import { AppButton } from '@/components/common/AppButton';
import { AppInput } from '@/components/common/AppInput';
import { FormField } from '@/components/forms/FormField';
import {
  getMutationErrorMessage,
  useChangePasswordMutation,
} from '../hooks/useProfile';
import { changePasswordSchema, type ChangePasswordFormValues } from '../schemas';

export interface ChangePasswordFormProps {
  onSuccess?: (message: string) => void;
}

export function ChangePasswordForm({ onSuccess }: ChangePasswordFormProps) {
  const changePassword = useChangePasswordMutation();
  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const response = await changePassword.mutateAsync(values);
      reset();
      onSuccess?.(response.message);
    } catch {
      // Error is shown from mutation state.
    }
  });

  const errorMessage = changePassword.error
    ? getMutationErrorMessage(changePassword.error, 'Unable to change password.')
    : null;

  return (
    <Stack component="form" spacing={2.5} onSubmit={onSubmit} noValidate>
      {errorMessage ? (
        <AppAlert severity="error" title="Password update failed">
          {errorMessage}
        </AppAlert>
      ) : null}

      <Controller
        name="currentPassword"
        control={control}
        render={({ field }) => (
          <FormField
            id="profile-current-password"
            label="Current password"
            required
            errorMessage={errors.currentPassword?.message}
          >
            <AppInput {...field} type="password" autoComplete="current-password" />
          </FormField>
        )}
      />

      <Controller
        name="newPassword"
        control={control}
        render={({ field }) => (
          <FormField
            id="profile-new-password"
            label="New password"
            required
            helperText="At least 8 characters with upper, lower, number, and special character."
            errorMessage={errors.newPassword?.message}
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
            id="profile-confirm-password"
            label="Confirm new password"
            required
            errorMessage={errors.confirmPassword?.message}
          >
            <AppInput {...field} type="password" autoComplete="new-password" />
          </FormField>
        )}
      />

      <AppButton
        type="submit"
        variant="contained"
        loading={changePassword.isPending}
        disabled={!isDirty || changePassword.isPending}
      >
        Update password
      </AppButton>
    </Stack>
  );
}
