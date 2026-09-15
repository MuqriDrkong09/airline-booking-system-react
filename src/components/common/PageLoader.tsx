import { Box, CircularProgress, Typography } from '@mui/material';

interface PageLoaderProps {
  fullPage?: boolean;
  label?: string;
}

export function PageLoader({ fullPage = false, label = 'Loading' }: PageLoaderProps) {
  const content = (
    <Box
      role="status"
      aria-live="polite"
      aria-busy="true"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        py: 6,
      }}
    >
      <CircularProgress aria-hidden="true" />
      <Typography variant="body1">{label}</Typography>
    </Box>
  );

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
      {content}
    </Box>
  );
}
