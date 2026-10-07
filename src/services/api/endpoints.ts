/**
 * Centralized API path constants.
 * Domain services should use these instead of hard-coded URL strings.
 */
export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    me: '/auth/me',
    changePassword: '/auth/change-password',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    verifyEmail: '/auth/verify-email',
  },
  airports: {
    root: '/airports',
    search: '/airports/search',
    byCode: (code: string) => `/airports/${encodeURIComponent(code)}`,
  },
  flights: {
    search: '/flights/search',
    byId: (flightId: string) => `/flights/${encodeURIComponent(flightId)}`,
    status: '/flights/status',
  },
  bookings: {
    root: '/bookings',
    byReference: (reference: string) => `/bookings/${encodeURIComponent(reference)}`,
    cancel: (reference: string) => `/bookings/${encodeURIComponent(reference)}/cancel`,
    checkIn: (reference: string) => `/bookings/${encodeURIComponent(reference)}/check-in`,
  },
  passengers: {
    root: '/passengers',
    byId: (passengerId: string) => `/passengers/${encodeURIComponent(passengerId)}`,
  },
  payments: {
    process: '/payments/process',
  },
  users: {
    me: '/auth/me',
    changePassword: '/auth/change-password',
  },
  notifications: {
    root: '/notifications',
    unreadCount: '/notifications/unread-count',
    readAll: '/notifications/read-all',
    read: (notificationId: string) =>
      `/notifications/${encodeURIComponent(notificationId)}/read`,
    byId: (notificationId: string) =>
      `/notifications/${encodeURIComponent(notificationId)}`,
  },
  favourites: {
    root: '/favourites',
    byFlightId: (flightId: string) => `/favourites/${encodeURIComponent(flightId)}`,
    status: (flightId: string) =>
      `/favourites/${encodeURIComponent(flightId)}/status`,
  },
  promoCodes: {
    validate: '/promo-codes/validate',
  },
  admin: {
    dashboard: '/admin/dashboard',
    flights: '/admin/flights',
    flightById: (flightId: string) => `/admin/flights/${encodeURIComponent(flightId)}`,
    flightStatus: (flightId: string) =>
      `/admin/flights/${encodeURIComponent(flightId)}/status`,
    airports: '/admin/airports',
    airportById: (airportId: string) => `/admin/airports/${encodeURIComponent(airportId)}`,
    airportActive: (airportId: string) =>
      `/admin/airports/${encodeURIComponent(airportId)}/active`,
    aircraft: '/admin/aircraft',
    aircraftById: (aircraftId: string) => `/admin/aircraft/${encodeURIComponent(aircraftId)}`,
    aircraftActive: (aircraftId: string) =>
      `/admin/aircraft/${encodeURIComponent(aircraftId)}/active`,
    bookings: '/admin/bookings',
    bookingByReference: (reference: string) =>
      `/admin/bookings/${encodeURIComponent(reference)}`,
    bookingCancel: (reference: string) =>
      `/admin/bookings/${encodeURIComponent(reference)}/cancel`,
    bookingRefund: (reference: string) =>
      `/admin/bookings/${encodeURIComponent(reference)}/refund`,
    bookingFlightOptions: '/admin/bookings/flight-options',
    users: '/admin/users',
    userById: (userId: string) => `/admin/users/${encodeURIComponent(userId)}`,
    userActive: (userId: string) => `/admin/users/${encodeURIComponent(userId)}/active`,
    userRole: (userId: string) => `/admin/users/${encodeURIComponent(userId)}/role`,
    promoCodes: '/admin/promo-codes',
    promoCodeById: (promoCodeId: string) =>
      `/admin/promo-codes/${encodeURIComponent(promoCodeId)}`,
    promoCodeActive: (promoCodeId: string) =>
      `/admin/promo-codes/${encodeURIComponent(promoCodeId)}/active`,
    reports: '/admin/reports',
  },
} as const;

/** @deprecated Prefer {@link API_ENDPOINTS}. */
export const endpoints = API_ENDPOINTS;
