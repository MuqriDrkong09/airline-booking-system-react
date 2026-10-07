import { API_ENDPOINTS } from '@/services/api';

describe('API_ENDPOINTS', () => {
  it('exposes auth, flight, booking, and admin paths', () => {
    expect(API_ENDPOINTS.auth.login).toBe('/auth/login');
    expect(API_ENDPOINTS.flights.search).toBe('/flights/search');
    expect(API_ENDPOINTS.airports.byCode('kul')).toBe('/airports/kul');
    expect(API_ENDPOINTS.bookings.byReference('AB/1')).toBe(
      `/bookings/${encodeURIComponent('AB/1')}`,
    );
    expect(API_ENDPOINTS.admin.dashboard).toBe('/admin/dashboard');
    expect(API_ENDPOINTS.notifications.unreadCount).toBe('/notifications/unread-count');
  });
});
