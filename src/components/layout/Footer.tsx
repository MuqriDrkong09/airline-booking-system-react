import { Box, Container, Link, Typography } from '@mui/material';

interface FooterProps {
  appName: string;
}

export function Footer({ appName }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        borderTop: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        py: 3,
        mt: 'auto',
      }}
    >
      <Container
        maxWidth="lg"
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: 1,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          © {year} {appName}. All rights reserved.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Need help?{' '}
          <Link href="mailto:support@example.com" underline="hover">
            Contact support
          </Link>
        </Typography>
      </Container>
    </Box>
  );
}
