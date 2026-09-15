import { Link as RouterLink } from 'react-router-dom';
import { AppButton, EmptyState, PageContainer } from '@/components/common';

interface PlaceholderPageProps {
  title: string;
}

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <PageContainer>
      <EmptyState
        title={title}
        message="This section is not available yet. Booking features will be added in a later update."
        action={
          <AppButton component={RouterLink} to="/" variant="contained" sx={{ mt: 1 }}>
            Back to home
          </AppButton>
        }
      />
    </PageContainer>
  );
}
