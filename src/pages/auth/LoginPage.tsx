import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useLocation, useNavigate } from 'react-router-dom';
import { env } from '@/config/env';
import { AuthPageShell } from '@/features/auth/components/AuthPageShell';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { getPostLoginRedirect } from '@/features/auth/utils/authHelpers';

function readFromState(state: unknown): string | null {
  if (
    typeof state === 'object' &&
    state !== null &&
    'from' in state &&
    typeof (state as { from?: unknown }).from === 'string'
  ) {
    return (state as { from: string }).from;
  }

  return null;
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = readFromState(location.state);

  return (
    <AuthPageShell
      title="Sign in"
      description="Access your AeroBook customer or admin workspace."
      footer={
        env.useMockAuth ? (
          <Stack spacing={0.5}>
            <Typography variant="caption" color="text.secondary">
              Demo: user@example.com / Password123! or admin@example.com / Password123!
            </Typography>
          </Stack>
        ) : undefined
      }
    >
      <LoginForm
        onSuccess={(user) => {
          void navigate(getPostLoginRedirect(user.role, from), { replace: true });
        }}
      />
    </AuthPageShell>
  );
}
