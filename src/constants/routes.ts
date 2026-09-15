export const APP_ROUTES = {
  home: '/',
  flights: '/flights',
  bookings: '/bookings',
  checkIn: '/check-in',
  profile: '/profile',
} as const;

export type AppRoute = (typeof APP_ROUTES)[keyof typeof APP_ROUTES];
