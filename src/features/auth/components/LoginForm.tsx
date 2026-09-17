import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { AppAlert } from '@/components/common/AppAlert';
import { AppButton } from '@/components/common/AppButton';
import { AppInput } from '@/components/common/AppInput';
import { FormField } from '@/components/forms/FormField';
import { APP_ROUTES } from '@/constants/routes';
import type { AuthUser } from '@/types/auth';
import { AuthTextLink } from './AuthPageShell';
import { useAuth } from '../hooks/useAuth';
import { loginSchema, type LoginFormValues } from '../schemas';

export interface LoginFormProps {
  onSuccess?: (user: AuthUser) => void | Promise<void>;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const { login, isSubmitting, error, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
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
            <AppInput
              {...field}
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        onClick={() => setShowPassword((visible) => !visible)}
                        onMouseDown={(event) => event.preventDefault()}
                        edge="end"
                      >
                        {showPassword ? (
                          <EyeOff aria-hidden="true" size={18} />
                        ) : (
                          <Eye aria-hidden="true" size={18} />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
          </FormField>
        )}
      />

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
        sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between' }}
      >
        <Controller
          name="rememberMe"
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
              label="Remember me"
            />
          )}
        />
        <Typography variant="body2">
          <AuthTextLink to={APP_ROUTES.public.forgotPassword}>Forgot password?</AuthTextLink>
        </Typography>
      </Stack>

      <AppButton type="submit" variant="contained" size="large" loading={isSubmitting}>
        Sign in
      </AppButton>

      <Typography variant="body2" sx={{ textAlign: 'center' }}>
        Need an account? <AuthTextLink to={APP_ROUTES.public.register}>Create one</AuthTextLink>
      </Typography>
    </Stack>
  );
}
