import { Box } from '@mui/material';

export function SkipLink() {
  return (
    <Box
      component="a"
      href="#main-content"
      sx={{
        position: 'absolute',
        left: 16,
        top: -100,
        zIndex: (theme) => theme.zIndex.tooltip + 1,
        bgcolor: 'secondary.main',
        color: 'secondary.contrastText',
        px: 2,
        py: 1,
        borderRadius: 1,
        textDecoration: 'none',
        fontWeight: 700,
        outline: 'none',
        '&:focus': {
          top: 16,
        },
        '&:focus-visible': {
          top: 16,
          outline: '2px solid',
          outlineColor: 'primary.main',
          outlineOffset: 2,
        },
      }}
    >
      Skip to main content
    </Box>
  );
}
