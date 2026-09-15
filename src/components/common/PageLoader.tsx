import Box from '@mui/material/Box';
import { LoadingSpinner } from './LoadingSpinner';

export interface PageLoaderProps {
  fullPage?: boolean;
  label?: string;
}

export function PageLoader({ fullPage = false, label = 'Loading' }: PageLoaderProps) {
  const content = <LoadingSpinner label={label} size={40} centered={!fullPage} />;

  if (!fullPage) {
    return content;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        px: 2,
      }}
    >
      <LoadingSpinner label={label} size={40} />
    </Box>
  );
}
