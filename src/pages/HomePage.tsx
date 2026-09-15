import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { CalendarCheck, Gauge, Search, Ticket } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';
import { AppButton, AppCard, PageContainer, SectionHeader } from '@/components/common';
import { env } from '@/config/env';
import { APP_ROUTES } from '@/constants/routes';

const highlights = [
  {
    title: 'Search flights',
    description: 'Compare routes and schedules in the customer workspace.',
    icon: Search,
    to: APP_ROUTES.customer.flights,
  },
  {
    title: 'Manage bookings',
    description: 'Review upcoming trips and booking details in one place.',
    icon: Ticket,
    to: APP_ROUTES.customer.bookings,
  },
  {
    title: 'Online check-in',
    description: 'Complete check-in and access boarding information faster.',
    icon: CalendarCheck,
    to: APP_ROUTES.customer.checkIn,
  },
  {
    title: 'Admin dashboard',
    description: 'Manage flights, airports, bookings, and reporting tools.',
    icon: Gauge,
    to: APP_ROUTES.admin.dashboard,
  },
] as const;

export function HomePage() {
  return (
    <PageContainer>
      <Stack spacing={2} sx={{ maxWidth: 720 }}>
        <SectionHeader
          component="h1"
          title="Book your next journey with confidence"
          description={`${env.appName} is a modern airline booking platform. Choose a customer or admin workspace to explore the application layouts.`}
        />
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <AppButton
            component={RouterLink}
            to={APP_ROUTES.customer.flights}
            variant="contained"
            size="large"
          >
            Browse flights
          </AppButton>
          <AppButton
            component={RouterLink}
            to={APP_ROUTES.admin.dashboard}
            variant="outlined"
            size="large"
          >
            Open admin
          </AppButton>
        </Stack>
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
          gap: 2,
        }}
      >
        {highlights.map((item) => (
          <AppCard
            key={item.title}
            title={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <item.icon aria-hidden="true" size={22} />
                <Typography component="span">{item.title}</Typography>
              </Box>
            }
            footer={
              <AppButton component={RouterLink} to={item.to} size="small">
                Open {item.title.toLowerCase()}
              </AppButton>
            }
            sx={{ height: '100%' }}
          >
            <Typography variant="body2" color="text.secondary">
              {item.description}
            </Typography>
          </AppCard>
        ))}
      </Box>
    </PageContainer>
  );
}
