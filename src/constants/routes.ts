export const APP_ROUTES = {
  public: {
    home: '/',
    login: '/login',
    register: '/register',
    forgotPassword: '/forgot-password',
    resetPassword: '/reset-password',
    verifyEmail: '/verify-email',
  },
  customer: {
    root: '/app',
    home: '/app',
    flights: '/app/flights',
    flightDetails: (flightId: string) => `/app/flights/${encodeURIComponent(flightId)}`,
    flightPassengers: (flightId: string) =>
      `/app/flights/${encodeURIComponent(flightId)}/passengers`,
    flightSeats: (flightId: string) =>
      `/app/flights/${encodeURIComponent(flightId)}/seats`,
    flightBaggage: (flightId: string) =>
      `/app/flights/${encodeURIComponent(flightId)}/baggage`,
    flightMeals: (flightId: string) =>
      `/app/flights/${encodeURIComponent(flightId)}/meals`,
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
