import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { AppButton, ErrorState, PageContainer } from '@/components/common';
import { APP_ROUTES } from '@/constants/routes';
import { HTTP_STATUS_MESSAGES } from '@/services/api';
import { toSafeInternalPath } from '@/utils/safeInternalPath';

const RETURN_PATH_ROOTS = [APP_ROUTES.customer.root, APP_ROUTES.admin.root] as const;

export function UnauthorizedPage() {
  const [searchParams] = useSearchParams();
  const from = toSafeInternalPath(searchParams.get('from'), RETURN_PATH_ROOTS);

  return (
    <PageContainer>
      <ErrorState
        title="401 — Sign in required"
        message={HTTP_STATUS_MESSAGES[401]}
        icon={<LogIn aria-hidden="true" size={40} />}
        action={
          <AppButton
            component={RouterLink}
            to={APP_ROUTES.public.login}
            state={from ? { from } : undefined}
            variant="contained"
            sx={{ mt: 1 }}
          >
            Sign in
          </AppButton>
        }
      />
    </PageContainer>
  );
}
