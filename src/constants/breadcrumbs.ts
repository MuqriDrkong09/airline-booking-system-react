import { APP_ROUTES } from './routes';

export interface BreadcrumbItem {
  to: string;
  label: string;
}

const BREADCRUMB_LABELS: Readonly<Record<string, string>> = {
  [APP_ROUTES.public.home]: 'Home',
  [APP_ROUTES.public.login]: 'Sign in',
  [APP_ROUTES.public.register]: 'Register',
  [APP_ROUTES.public.forgotPassword]: 'Forgot password',
  [APP_ROUTES.public.resetPassword]: 'Reset password',
  [APP_ROUTES.public.verifyEmail]: 'Verify email',
  [APP_ROUTES.customer.root]: 'Customer',
  [APP_ROUTES.customer.flights]: 'Search Flights',
  [APP_ROUTES.customer.bookings]: 'My Bookings',
  [APP_ROUTES.customer.checkIn]: 'Check-in',
  [APP_ROUTES.customer.notifications]: 'Notifications',
  [APP_ROUTES.customer.profile]: 'Profile',
  [APP_ROUTES.admin.root]: 'Admin',
  [APP_ROUTES.admin.flights]: 'Flights',
  [APP_ROUTES.admin.airports]: 'Airports',
  [APP_ROUTES.admin.aircraft]: 'Aircraft',
  [APP_ROUTES.admin.bookings]: 'Bookings',
  [APP_ROUTES.admin.users]: 'Users',
  [APP_ROUTES.admin.promoCodes]: 'Promo Codes',
  [APP_ROUTES.admin.reports]: 'Reports',
};

const SECTION_HOME_LABELS: Readonly<Record<string, string>> = {
  [APP_ROUTES.customer.root]: 'Home',
  [APP_ROUTES.admin.root]: 'Dashboard',
};

export function getBreadcrumbsForPath(pathname: string): BreadcrumbItem[] {
  const normalized = pathname.replace(/\/+$/, '') || '/';
  const segments = normalized.split('/').filter(Boolean);
  const crumbs: BreadcrumbItem[] = [];

  let currentPath = '';

  for (const segment of segments) {
    currentPath += `/${segment}`;
    const label = BREADCRUMB_LABELS[currentPath];

    if (label) {
      crumbs.push({ to: currentPath, label });
      continue;
    }

    // Dynamic flight details: /app/flights/:flightId
    if (/^\/app\/flights\/[^/]+$/.test(currentPath)) {
      crumbs.push({ to: currentPath, label: 'Flight details' });
      continue;
    }

    // Passenger forms: /app/flights/:flightId/passengers
    if (/^\/app\/flights\/[^/]+\/passengers$/.test(currentPath)) {
      crumbs.push({ to: currentPath, label: 'Passengers' });
      continue;
    }

    // Seat selection: /app/flights/:flightId/seats
    if (/^\/app\/flights\/[^/]+\/seats$/.test(currentPath)) {
      crumbs.push({ to: currentPath, label: 'Seats' });
    }
  }

  if (crumbs.length === 1) {
    const only = crumbs[0];
    const homeLabel = only ? SECTION_HOME_LABELS[only.to] : undefined;

    if (only && homeLabel) {
      crumbs.push({
        to: only.to,
        label: homeLabel,
      });
    }
  }

  return crumbs;
}
