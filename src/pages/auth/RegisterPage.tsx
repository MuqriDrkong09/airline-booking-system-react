import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppAlert } from '@/components/common/AppAlert';
import { APP_ROUTES } from '@/constants/routes';
import { AuthPageShell, AuthTextLink } from '@/features/auth/components/AuthPageShell';
import { RegisterForm } from '@/features/auth/components/RegisterForm';
import { extractDemoToken } from '@/features/auth/utils/authHelpers';

export function RegisterPage() {
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  return (
    <AuthPageShell
      title="Create account"
      description="Register for a customer account to book and manage flights."
      maxWidth="md"
      contentMaxWidth={720}
      footer={
        <Typography variant="body2">
          Already have an account? <AuthTextLink to={APP_ROUTES.public.login}>Sign in</AuthTextLink>
        </Typography>
      }
    >
      <Stack spacing={2}>
        {successMessage ? (
          <AppAlert severity="success" title="Account created">
            {successMessage}
          </AppAlert>
        ) : null}
        {!successMessage ? (
          <RegisterForm
            onSuccess={(message) => {
              setSuccessMessage(message);
              const token = extractDemoToken(message);
              window.setTimeout(() => {
                void navigate(
                  token
                    ? `${APP_ROUTES.public.verifyEmail}?token=${encodeURIComponent(token)}`
                    : APP_ROUTES.public.verifyEmail,
                );
              }, 1200);
            }}
          />
        ) : null}
      </Stack>
    </AuthPageShell>
  );
}
