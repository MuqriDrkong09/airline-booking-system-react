export const APP_ROUTES = {
  public: {
    home: '/',
    login: '/login',
  },
  customer: {
    root: '/app',
    home: '/app',
    flights: '/app/flights',
    bookings: '/app/bookings',
    checkIn: '/app/check-in',
    notifications: '/app/notifications',
    profile: '/app/profile',
  },
  admin: {
    root: '/admin',
    dashboard: '/admin',
    flights: '/admin/flights',
    airports: '/admin/airports',
    aircraft: '/admin/aircraft',
    bookings: '/admin/bookings',
    users: '/admin/users',
    promoCodes: '/admin/promo-codes',
    reports: '/admin/reports',
  },
} as const;

export const SIDEBAR_WIDTH = 260;
