import type { LucideIcon } from 'lucide-react';
import {
  Bell,
  Building2,
  ClipboardList,
  Gauge,
  Home,
  Plane,
  Search,
  Shield,
  Ticket,
  User,
  Users,
  Tag,
  ChartColumn,
} from 'lucide-react';
import { APP_ROUTES } from './routes';

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  end?: boolean;
}

export const PUBLIC_NAV_ITEMS: readonly NavItem[] = [
  { label: 'Home', to: APP_ROUTES.public.home, icon: Home, end: true },
  { label: 'Search Flights', to: APP_ROUTES.customer.flights, icon: Search },
] as const;

export const CUSTOMER_NAV_ITEMS: readonly NavItem[] = [
  { label: 'Home', to: APP_ROUTES.customer.home, icon: Home, end: true },
  { label: 'Search Flights', to: APP_ROUTES.customer.flights, icon: Search },
  { label: 'My Bookings', to: APP_ROUTES.customer.bookings, icon: Ticket },
  { label: 'Check-in', to: APP_ROUTES.customer.checkIn, icon: ClipboardList },
  { label: 'Notifications', to: APP_ROUTES.customer.notifications, icon: Bell },
  { label: 'Profile', to: APP_ROUTES.customer.profile, icon: User },
] as const;

export const ADMIN_NAV_ITEMS: readonly NavItem[] = [
  { label: 'Dashboard', to: APP_ROUTES.admin.dashboard, icon: Gauge, end: true },
  { label: 'Flights', to: APP_ROUTES.admin.flights, icon: Plane },
  { label: 'Airports', to: APP_ROUTES.admin.airports, icon: Building2 },
  { label: 'Aircraft', to: APP_ROUTES.admin.aircraft, icon: Shield },
  { label: 'Bookings', to: APP_ROUTES.admin.bookings, icon: Ticket },
  { label: 'Users', to: APP_ROUTES.admin.users, icon: Users },
  { label: 'Promo Codes', to: APP_ROUTES.admin.promoCodes, icon: Tag },
  { label: 'Reports', to: APP_ROUTES.admin.reports, icon: ChartColumn },
] as const;

/** @deprecated Use PUBLIC_NAV_ITEMS or CUSTOMER_NAV_ITEMS */
export const PRIMARY_NAV_ITEMS = PUBLIC_NAV_ITEMS;
