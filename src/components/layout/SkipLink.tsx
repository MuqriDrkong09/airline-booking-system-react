import { Box } from '@mui/material';

export function SkipLink() {
  return (
    <Box
      component="a"
      href="#main-content"
      sx={{
        position: 'absolute',
        left: 16,
        top: -80,
        zIndex: (theme) => theme.zIndex.tooltip,
        bgcolor: 'secondary.main',
        color: 'secondary.contrastText',
        px: 2,
        py: 1,
        borderRadius: 1,
        textDecoration: 'none',
        fontWeight: 600,
        '&:focus': {
          top: 16,
        },
      }}
    >
      Skip to main content
    </Box>
  );
}
