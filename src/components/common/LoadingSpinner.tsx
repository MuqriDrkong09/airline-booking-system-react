import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import type { CircularProgressProps } from '@mui/material/CircularProgress';

export interface LoadingSpinnerProps extends Omit<CircularProgressProps, 'variant'> {
  label?: string;
  centered?: boolean;
}

export function LoadingSpinner({
  label,
  centered = false,
  size = 32,
  ...props
}: LoadingSpinnerProps) {
  const content = (
    <Box
      role="status"
      aria-live="polite"
      aria-busy="true"
      sx={{
        position: 'relative',
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1.5,
      }}
    >
      <CircularProgress {...props} size={size} aria-hidden="true" />
      {label ? (
        <Typography variant="body2">{label}</Typography>
      ) : (
        <Typography
          component="span"
          sx={{
            position: 'absolute',
            width: 1,
            height: 1,
            padding: 0,
            margin: -1,
            overflow: 'hidden',
            clip: 'rect(0, 0, 0, 0)',
            whiteSpace: 'nowrap',
            border: 0,
          }}
        >
          Loading
        </Typography>
      )}
    </Box>
  );

  if (!centered) {
    return content;
  }

  return (
    <Box sx={{ display: 'grid', placeItems: 'center', width: '100%', py: 4 }}>{content}</Box>
  );
}
