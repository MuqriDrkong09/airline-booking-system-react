import { Box, Button, Card, CardContent, Stack, Typography } from '@mui/material';
import { CalendarCheck, Search, Ticket } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';
import { env } from '@/config/env';
import { APP_ROUTES } from '@/constants/routes';

const highlights = [
  {
    title: 'Search flights',
    description: 'Compare routes and schedules when flight search is enabled.',
    icon: Search,
    to: APP_ROUTES.flights,
  },
  {
    title: 'Manage bookings',
    description: 'Review upcoming trips and booking details in one place.',
    icon: Ticket,
    to: APP_ROUTES.bookings,
  },
  {
    title: 'Online check-in',
    description: 'Complete check-in and access boarding information faster.',
    icon: CalendarCheck,
    to: APP_ROUTES.checkIn,
  },
] as const;

export function HomePage() {
  return (
    <Stack spacing={4}>
      <Stack spacing={2} sx={{ maxWidth: 720 }}>
        <Typography variant="h3" component="h1">
          Book your next journey with confidence
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {env.appName} is a modern airline booking platform. Core booking, payment, and passenger
          flows will be added next. This shell is ready for those features.
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <Button component={RouterLink} to={APP_ROUTES.flights} variant="contained" size="large">
            Browse flights
          </Button>
          <Button component={RouterLink} to={APP_ROUTES.checkIn} variant="outlined" size="large">
            Go to check-in
          </Button>
        </Stack>
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
          gap: 2,
        }}
      >
        {highlights.map((item) => (
          <Card key={item.title} variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <item.icon aria-hidden="true" size={28} />
              <Typography variant="h6" component="h2" sx={{ mt: 1.5, mb: 1 }}>
                {item.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {item.description}
              </Typography>
              <Button component={RouterLink} to={item.to} size="small">
                Open {item.title.toLowerCase()}
              </Button>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Stack>
  );
}
