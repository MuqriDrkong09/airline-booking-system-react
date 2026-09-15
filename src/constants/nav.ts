import { APP_ROUTES } from './routes';

export interface NavItem {
  label: string;
  to: string;
}

export const PRIMARY_NAV_ITEMS: readonly NavItem[] = [
  { label: 'Flights', to: APP_ROUTES.flights },
  { label: 'My Bookings', to: APP_ROUTES.bookings },
  { label: 'Check-in', to: APP_ROUTES.checkIn },
] as const;
