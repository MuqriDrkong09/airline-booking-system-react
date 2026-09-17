import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppAlert } from '@/components/common/AppAlert';
import { APP_ROUTES } from '@/constants/routes';
import { AuthPageShell, AuthTextLink } from '@/features/auth/components/AuthPageShell';
import { ResetPasswordForm } from '@/features/auth/components/ResetPasswordForm';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  return (
    <AuthPageShell
      title="Reset password"
      description="Choose a new password for your AeroBook account."
      footer={
        <Typography variant="body2">
          <AuthTextLink to={APP_ROUTES.public.login}>Back to sign in</AuthTextLink>
        </Typography>
      }
    >
      <Stack spacing={2}>
        {successMessage ? (
          <AppAlert severity="success" title="Password updated">
            {successMessage}
          </AppAlert>
        ) : null}
        <ResetPasswordForm
          defaultToken={token}
          onSuccess={async (message) => {
            setSuccessMessage(message);
            await new Promise((resolve) => {
              setTimeout(resolve, 1000);
            });
            void navigate(APP_ROUTES.public.login);
          }}
        />
      </Stack>
    </AuthPageShell>
  );
}
