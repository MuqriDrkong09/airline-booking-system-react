import {
  extractDemoToken,
  getDisplayName,
  getPostLoginRedirect,
  getRoleLabel,
  toUserMenuModel,
} from '@/features/auth';
import { APP_ROUTES } from '@/constants/routes';
import { UserRole } from '@/types/auth';
import { mockAdminUser, mockCustomerUser } from '@tests/utils/authTestUtils';

describe('authHelpers', () => {
  it('builds display names and role labels', () => {
    expect(getDisplayName(mockCustomerUser)).toBe('Alex Traveler');
    expect(getRoleLabel(UserRole.USER)).toBe('Customer');
    expect(getRoleLabel(UserRole.ADMIN)).toBe('Administrator');
  });

  it('maps users into menu models', () => {
    expect(toUserMenuModel(mockAdminUser)).toEqual({
      name: 'Jordan Admin',
      email: 'admin@example.com',
      roleLabel: 'Administrator',
    });
  });

  it('returns role home by default and respects safe return paths', () => {
    expect(getPostLoginRedirect(UserRole.USER)).toBe(APP_ROUTES.customer.home);
    expect(getPostLoginRedirect(UserRole.ADMIN)).toBe(APP_ROUTES.admin.dashboard);
    expect(getPostLoginRedirect(UserRole.USER, '/app/bookings')).toBe('/app/bookings');
    expect(getPostLoginRedirect(UserRole.USER, '/admin')).toBe(APP_ROUTES.customer.home);
    expect(getPostLoginRedirect(UserRole.ADMIN, '/app/flights')).toBe(APP_ROUTES.admin.dashboard);
  });

  it('extracts quoted demo tokens from mock messages', () => {
    expect(
      extractDemoToken(
        'Registration successful. Use verification token "verify.abc.123" to verify.',
      ),
    ).toBe('verify.abc.123');
    expect(extractDemoToken('No token here')).toBeNull();
  });
});
