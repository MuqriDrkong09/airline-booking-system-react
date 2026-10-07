import { APP_ROUTES, SIDEBAR_WIDTH } from '@/constants/routes';

describe('APP_ROUTES', () => {
  it('exposes public auth and home paths', () => {
    expect(APP_ROUTES.public).toEqual({
      home: '/',
      login: '/login',
      register: '/register',
      forgotPassword: '/forgot-password',
      resetPassword: '/reset-password',
      verifyEmail: '/verify-email',
      forbidden: '/forbidden',
    });
  });

  it('exposes customer workspace static paths', () => {
    expect(APP_ROUTES.customer.root).toBe('/app');
    expect(APP_ROUTES.customer.home).toBe('/app');
    expect(APP_ROUTES.customer.flights).toBe('/app/flights');
    expect(APP_ROUTES.customer.bookings).toBe('/app/bookings');
    expect(APP_ROUTES.customer.checkIn).toBe('/app/check-in');
    expect(APP_ROUTES.customer.flightStatus).toBe('/app/flight-status');
    expect(APP_ROUTES.customer.favourites).toBe('/app/favourites');
    expect(APP_ROUTES.customer.notifications).toBe('/app/notifications');
    expect(APP_ROUTES.customer.profile).toBe('/app/profile');
  });

  it('builds encoded customer flight flow paths', () => {
    const flightId = 'FL 100/A';
    const encoded = encodeURIComponent(flightId);

    expect(APP_ROUTES.customer.flightDetails(flightId)).toBe(`/app/flights/${encoded}`);
    expect(APP_ROUTES.customer.flightPassengers(flightId)).toBe(
      `/app/flights/${encoded}/passengers`,
    );
    expect(APP_ROUTES.customer.flightSeats(flightId)).toBe(`/app/flights/${encoded}/seats`);
    expect(APP_ROUTES.customer.flightBaggage(flightId)).toBe(
      `/app/flights/${encoded}/baggage`,
    );
    expect(APP_ROUTES.customer.flightMeals(flightId)).toBe(`/app/flights/${encoded}/meals`);
    expect(APP_ROUTES.customer.flightAddons(flightId)).toBe(`/app/flights/${encoded}/addons`);
    expect(APP_ROUTES.customer.flightSummary(flightId)).toBe(
      `/app/flights/${encoded}/summary`,
    );
    expect(APP_ROUTES.customer.flightPayment(flightId)).toBe(
      `/app/flights/${encoded}/payment`,
    );
  });

  it('builds encoded customer booking document paths', () => {
    const reference = 'AB/REF 1';
    const encoded = encodeURIComponent(reference);

    expect(APP_ROUTES.customer.bookingDetail(reference)).toBe(`/app/bookings/${encoded}`);
    expect(APP_ROUTES.customer.bookingConfirmation(reference)).toBe(
      `/app/bookings/${encoded}/confirmation`,
    );
    expect(APP_ROUTES.customer.bookingManage(reference)).toBe(
      `/app/bookings/${encoded}/manage`,
    );
    expect(APP_ROUTES.customer.bookingInvoice(reference)).toBe(
      `/app/bookings/${encoded}/invoice`,
    );
    expect(APP_ROUTES.customer.bookingETicket(reference)).toBe(
      `/app/bookings/${encoded}/eticket`,
    );
    expect(APP_ROUTES.customer.bookingBoardingPass(reference)).toBe(
      `/app/bookings/${encoded}/boarding-pass`,
    );
  });

  it('exposes admin workspace paths', () => {
    expect(APP_ROUTES.admin.root).toBe('/admin');
    expect(APP_ROUTES.admin.dashboard).toBe('/admin');
    expect(APP_ROUTES.admin.flights).toBe('/admin/flights');
    expect(APP_ROUTES.admin.airports).toBe('/admin/airports');
    expect(APP_ROUTES.admin.aircraft).toBe('/admin/aircraft');
    expect(APP_ROUTES.admin.bookings).toBe('/admin/bookings');
    expect(APP_ROUTES.admin.users).toBe('/admin/users');
    expect(APP_ROUTES.admin.promoCodes).toBe('/admin/promo-codes');
    expect(APP_ROUTES.admin.reports).toBe('/admin/reports');
  });

  it('builds admin aircraft seat configuration paths', () => {
    expect(APP_ROUTES.admin.aircraftSeats('aircraft-admin-1')).toBe(
      '/admin/aircraft/aircraft-admin-1/seats',
    );
    expect(APP_ROUTES.admin.aircraftSeats('id/with spaces')).toBe(
      `/admin/aircraft/${encodeURIComponent('id/with spaces')}/seats`,
    );
  });
});

describe('SIDEBAR_WIDTH', () => {
  it('keeps the dashboard sidebar width constant', () => {
    expect(SIDEBAR_WIDTH).toBe(260);
  });
});
