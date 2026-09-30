import { getBreadcrumbsForPath } from '@/constants/breadcrumbs';
import { APP_ROUTES } from '@/constants/routes';

describe('getBreadcrumbsForPath', () => {
  it('normalizes trailing slashes and empty paths to root', () => {
    expect(getBreadcrumbsForPath('/')).toEqual([]);
    expect(getBreadcrumbsForPath('///')).toEqual([]);
  });

  it('builds public auth breadcrumbs', () => {
    expect(getBreadcrumbsForPath(APP_ROUTES.public.login)).toEqual([
      { to: '/login', label: 'Sign in' },
    ]);
    expect(getBreadcrumbsForPath(APP_ROUTES.public.register)).toEqual([
      { to: '/register', label: 'Register' },
    ]);
    expect(getBreadcrumbsForPath(APP_ROUTES.public.forgotPassword)).toEqual([
      { to: '/forgot-password', label: 'Forgot password' },
    ]);
    expect(getBreadcrumbsForPath(APP_ROUTES.public.resetPassword)).toEqual([
      { to: '/reset-password', label: 'Reset password' },
    ]);
    expect(getBreadcrumbsForPath(APP_ROUTES.public.verifyEmail)).toEqual([
      { to: '/verify-email', label: 'Verify email' },
    ]);
  });

  it('builds customer breadcrumbs', () => {
    expect(getBreadcrumbsForPath('/app/flights')).toEqual([
      { to: '/app', label: 'Customer' },
      { to: '/app/flights', label: 'Search Flights' },
    ]);
  });

  it('builds remaining customer workspace breadcrumbs', () => {
    expect(getBreadcrumbsForPath(APP_ROUTES.customer.bookings)).toEqual([
      { to: '/app', label: 'Customer' },
      { to: '/app/bookings', label: 'My Bookings' },
    ]);
    expect(getBreadcrumbsForPath(APP_ROUTES.customer.checkIn)).toEqual([
      { to: '/app', label: 'Customer' },
      { to: '/app/check-in', label: 'Check-in' },
    ]);
    expect(getBreadcrumbsForPath(APP_ROUTES.customer.flightStatus)).toEqual([
      { to: '/app', label: 'Customer' },
      { to: '/app/flight-status', label: 'Flight status' },
    ]);
    expect(getBreadcrumbsForPath(APP_ROUTES.customer.notifications)).toEqual([
      { to: '/app', label: 'Customer' },
      { to: '/app/notifications', label: 'Notifications' },
    ]);
    expect(getBreadcrumbsForPath(APP_ROUTES.customer.profile)).toEqual([
      { to: '/app', label: 'Customer' },
      { to: '/app/profile', label: 'Profile' },
    ]);
  });

  it('adds a section home crumb for root workspace paths', () => {
    expect(getBreadcrumbsForPath('/admin')).toEqual([
      { to: '/admin', label: 'Admin' },
      { to: '/admin', label: 'Dashboard' },
    ]);
    expect(getBreadcrumbsForPath('/app')).toEqual([
      { to: '/app', label: 'Customer' },
      { to: '/app', label: 'Home' },
    ]);
    expect(getBreadcrumbsForPath('/app/')).toEqual([
      { to: '/app', label: 'Customer' },
      { to: '/app', label: 'Home' },
    ]);
  });

  it('builds admin section breadcrumbs', () => {
    expect(getBreadcrumbsForPath(APP_ROUTES.admin.flights)).toEqual([
      { to: '/admin', label: 'Admin' },
      { to: '/admin/flights', label: 'Flights' },
    ]);
    expect(getBreadcrumbsForPath(APP_ROUTES.admin.airports)).toEqual([
      { to: '/admin', label: 'Admin' },
      { to: '/admin/airports', label: 'Airports' },
    ]);
    expect(getBreadcrumbsForPath(APP_ROUTES.admin.aircraft)).toEqual([
      { to: '/admin', label: 'Admin' },
      { to: '/admin/aircraft', label: 'Aircraft' },
    ]);
    expect(getBreadcrumbsForPath(APP_ROUTES.admin.bookings)).toEqual([
      { to: '/admin', label: 'Admin' },
      { to: '/admin/bookings', label: 'Bookings' },
    ]);
    expect(getBreadcrumbsForPath(APP_ROUTES.admin.users)).toEqual([
      { to: '/admin', label: 'Admin' },
      { to: '/admin/users', label: 'Users' },
    ]);
    expect(getBreadcrumbsForPath(APP_ROUTES.admin.promoCodes)).toEqual([
      { to: '/admin', label: 'Admin' },
      { to: '/admin/promo-codes', label: 'Promo Codes' },
    ]);
    expect(getBreadcrumbsForPath(APP_ROUTES.admin.reports)).toEqual([
      { to: '/admin', label: 'Admin' },
      { to: '/admin/reports', label: 'Reports' },
    ]);
  });

  it('labels dynamic flight booking-flow segments', () => {
    const flightId = 'FL-100';

    expect(getBreadcrumbsForPath(APP_ROUTES.customer.flightDetails(flightId))).toEqual([
      { to: '/app', label: 'Customer' },
      { to: '/app/flights', label: 'Search Flights' },
      { to: `/app/flights/${flightId}`, label: 'Flight details' },
    ]);
    expect(getBreadcrumbsForPath(APP_ROUTES.customer.flightPassengers(flightId))).toEqual([
      { to: '/app', label: 'Customer' },
      { to: '/app/flights', label: 'Search Flights' },
      { to: `/app/flights/${flightId}`, label: 'Flight details' },
      { to: `/app/flights/${flightId}/passengers`, label: 'Passengers' },
    ]);
    expect(getBreadcrumbsForPath(APP_ROUTES.customer.flightSeats(flightId))).toEqual([
      { to: '/app', label: 'Customer' },
      { to: '/app/flights', label: 'Search Flights' },
      { to: `/app/flights/${flightId}`, label: 'Flight details' },
      { to: `/app/flights/${flightId}/seats`, label: 'Seats' },
    ]);
    expect(getBreadcrumbsForPath(APP_ROUTES.customer.flightBaggage(flightId))).toEqual([
      { to: '/app', label: 'Customer' },
      { to: '/app/flights', label: 'Search Flights' },
      { to: `/app/flights/${flightId}`, label: 'Flight details' },
      { to: `/app/flights/${flightId}/baggage`, label: 'Baggage' },
    ]);
    expect(getBreadcrumbsForPath(APP_ROUTES.customer.flightMeals(flightId))).toEqual([
      { to: '/app', label: 'Customer' },
      { to: '/app/flights', label: 'Search Flights' },
      { to: `/app/flights/${flightId}`, label: 'Flight details' },
      { to: `/app/flights/${flightId}/meals`, label: 'Meals' },
    ]);
    expect(getBreadcrumbsForPath(APP_ROUTES.customer.flightAddons(flightId))).toEqual([
      { to: '/app', label: 'Customer' },
      { to: '/app/flights', label: 'Search Flights' },
      { to: `/app/flights/${flightId}`, label: 'Flight details' },
      { to: `/app/flights/${flightId}/addons`, label: 'Add-ons' },
    ]);
    expect(getBreadcrumbsForPath(APP_ROUTES.customer.flightSummary(flightId))).toEqual([
      { to: '/app', label: 'Customer' },
      { to: '/app/flights', label: 'Search Flights' },
      { to: `/app/flights/${flightId}`, label: 'Flight details' },
      { to: `/app/flights/${flightId}/summary`, label: 'Summary' },
    ]);
    expect(getBreadcrumbsForPath(APP_ROUTES.customer.flightPayment(flightId))).toEqual([
      { to: '/app', label: 'Customer' },
      { to: '/app/flights', label: 'Search Flights' },
      { to: `/app/flights/${flightId}`, label: 'Flight details' },
      { to: `/app/flights/${flightId}/payment`, label: 'Payment' },
    ]);
  });

  it('labels dynamic booking document and manage segments', () => {
    const reference = 'AB-TEST1234';

    expect(getBreadcrumbsForPath(APP_ROUTES.customer.bookingDetail(reference))).toEqual([
      { to: '/app', label: 'Customer' },
      { to: '/app/bookings', label: 'My Bookings' },
      { to: `/app/bookings/${reference}`, label: 'Booking' },
    ]);
    expect(getBreadcrumbsForPath(APP_ROUTES.customer.bookingConfirmation(reference))).toEqual([
      { to: '/app', label: 'Customer' },
      { to: '/app/bookings', label: 'My Bookings' },
      { to: `/app/bookings/${reference}`, label: 'Booking' },
      { to: `/app/bookings/${reference}/confirmation`, label: 'Confirmation' },
    ]);
    expect(getBreadcrumbsForPath(APP_ROUTES.customer.bookingManage(reference))).toEqual([
      { to: '/app', label: 'Customer' },
      { to: '/app/bookings', label: 'My Bookings' },
      { to: `/app/bookings/${reference}`, label: 'Booking' },
      { to: `/app/bookings/${reference}/manage`, label: 'Manage' },
    ]);
    expect(getBreadcrumbsForPath(APP_ROUTES.customer.bookingETicket(reference))).toEqual([
      { to: '/app', label: 'Customer' },
      { to: '/app/bookings', label: 'My Bookings' },
      { to: `/app/bookings/${reference}`, label: 'Booking' },
      { to: `/app/bookings/${reference}/eticket`, label: 'E-ticket' },
    ]);
    expect(getBreadcrumbsForPath(APP_ROUTES.customer.bookingInvoice(reference))).toEqual([
      { to: '/app', label: 'Customer' },
      { to: '/app/bookings', label: 'My Bookings' },
      { to: `/app/bookings/${reference}`, label: 'Booking' },
      { to: `/app/bookings/${reference}/invoice`, label: 'Invoice' },
    ]);
    expect(getBreadcrumbsForPath(APP_ROUTES.customer.bookingBoardingPass(reference))).toEqual([
      { to: '/app', label: 'Customer' },
      { to: '/app/bookings', label: 'My Bookings' },
      { to: `/app/bookings/${reference}`, label: 'Booking' },
      { to: `/app/bookings/${reference}/boarding-pass`, label: 'Boarding pass' },
    ]);
  });

  it('skips unknown path segments without inventing labels', () => {
    expect(getBreadcrumbsForPath('/app/unknown-page')).toEqual([
      { to: '/app', label: 'Customer' },
      { to: '/app', label: 'Home' },
    ]);
    expect(getBreadcrumbsForPath('/app/flights/FL-1/unknown-step')).toEqual([
      { to: '/app', label: 'Customer' },
      { to: '/app/flights', label: 'Search Flights' },
      { to: '/app/flights/FL-1', label: 'Flight details' },
    ]);
  });
});
