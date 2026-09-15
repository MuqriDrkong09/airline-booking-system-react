import { Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { EmptyState } from '@/components/common/EmptyState';

interface PlaceholderPageProps {
  title: string;
}

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <EmptyState
      title={title}
      message="This section is not available yet. Booking features will be added in a later update."
      action={
        <Button component={RouterLink} to="/" variant="contained" sx={{ mt: 1 }}>
          Back to home
        </Button>
      }
    />
  );
}
