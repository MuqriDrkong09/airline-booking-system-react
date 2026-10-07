import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {
  Bell,
  CalendarCheck,
  Heart,
  RadioTower,
  Search,
  Ticket,
} from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';
import { AppButton, AppCard, SectionHeader } from '@/components/common';
import { APP_ROUTES } from '@/constants/routes';

const QUICK_ACTIONS = [
  {
    title: 'Search flights',
    description: 'Find and compare routes for your next trip.',
    icon: Search,
    to: APP_ROUTES.customer.flights,
  },
  {
    title: 'Flight status',
    description: 'Check gate, terminal, and live flight updates.',
    icon: RadioTower,
    to: APP_ROUTES.customer.flightStatus,
  },
  {
    title: 'My bookings',
    description: 'Review upcoming, past, and cancelled trips.',
    icon: Ticket,
    to: APP_ROUTES.customer.bookings,
  },
  {
    title: 'Online check-in',
    description: 'Check in and get ready for boarding.',
    icon: CalendarCheck,
    to: APP_ROUTES.customer.checkIn,
  },
  {
    title: 'Favourites',
    description: 'Jump back to flights you saved earlier.',
    icon: Heart,
    to: APP_ROUTES.customer.favourites,
  },
  {
    title: 'Notifications',
    description: 'See booking alerts and travel updates.',
    icon: Bell,
    to: APP_ROUTES.customer.notifications,
  },
] as const;

export function CustomerHomeQuickActions() {
  return (
    <Box>
      <SectionHeader
        title="Quick actions"
        description="Jump into the most common booking tasks."
      />
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
            lg: 'repeat(3, minmax(0, 1fr))',
          },
          gap: 2,
        }}
      >
        {QUICK_ACTIONS.map((item) => (
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
    </Box>
  );
}
