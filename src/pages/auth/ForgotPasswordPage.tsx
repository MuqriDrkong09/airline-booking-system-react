import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { AppAlert } from '@/components/common/AppAlert';
import { AppButton } from '@/components/common/AppButton';
import { APP_ROUTES } from '@/constants/routes';
import { AuthPageShell, AuthTextLink } from '@/features/auth/components/AuthPageShell';
import { ForgotPasswordForm } from '@/features/auth/components/ForgotPasswordForm';
import { extractDemoToken } from '@/features/auth/utils/authHelpers';

export function ForgotPasswordPage() {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState<string | null>(null);

  return (
    <AuthPageShell
      title="Forgot password"
      description="Enter your email and we will send password reset instructions."
      footer={
        <Typography variant="body2">
          Remembered it? <AuthTextLink to={APP_ROUTES.public.login}>Back to sign in</AuthTextLink>
        </Typography>
      }
    >
      <Stack spacing={2}>
        {successMessage ? (
          <AppAlert severity="success" title="Request received">
            {successMessage}
          </AppAlert>
        ) : null}
        {resetToken ? (
          <AppButton
            component={RouterLink}
            to={`${APP_ROUTES.public.resetPassword}?token=${encodeURIComponent(resetToken)}`}
            variant="contained"
          >
            Continue to reset password
          </AppButton>
        ) : null}
        <ForgotPasswordForm
          onSuccess={(message) => {
            setSuccessMessage(message);
            setResetToken(extractDemoToken(message));
          }}
        />
      </Stack>
    </AuthPageShell>
  );
}
