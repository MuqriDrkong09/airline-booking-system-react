import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppAlert } from '@/components/common/AppAlert';
import { APP_ROUTES } from '@/constants/routes';
import { AuthPageShell, AuthTextLink } from '@/features/auth/components/AuthPageShell';
import { VerifyEmailForm } from '@/features/auth/components/VerifyEmailForm';

export function VerifyEmailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  return (
    <AuthPageShell
      title="Verify email"
      description="Paste the verification token from your registration email."
      footer={
        <Typography variant="body2">
          Ready to continue? <AuthTextLink to={APP_ROUTES.public.login}>Sign in</AuthTextLink>
        </Typography>
      }
    >
      <Stack spacing={2}>
        {successMessage ? (
          <AppAlert severity="success" title="Email verified">
            {successMessage}
          </AppAlert>
        ) : null}
        <VerifyEmailForm
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
