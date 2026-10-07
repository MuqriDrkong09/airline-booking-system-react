import {
  ADMIN_AREA_ROLES,
  CUSTOMER_AREA_ROLES,
  canAccessAdminArea,
  canAccessCustomerArea,
  getHomePathForRole,
  hasRole,
} from '@/features/auth';
import { APP_ROUTES } from '@/constants/routes';
import { UserRole } from '@/types/auth';
import { mockAdminUser, mockCustomerUser } from '@tests/utils/authTestUtils';

describe('rbac helpers', () => {
  it('defines customer and admin area role sets', () => {
    expect(CUSTOMER_AREA_ROLES).toEqual([UserRole.USER, UserRole.ADMIN]);
    expect(ADMIN_AREA_ROLES).toEqual([UserRole.ADMIN]);
  });

  it('checks role membership', () => {
    expect(hasRole(mockCustomerUser, [UserRole.USER])).toBe(true);
    expect(hasRole(mockCustomerUser, [UserRole.ADMIN])).toBe(false);
    expect(hasRole(null, [UserRole.USER])).toBe(false);
  });

  it('gates customer and admin areas by role', () => {
    expect(canAccessCustomerArea(mockCustomerUser)).toBe(true);
    expect(canAccessCustomerArea(mockAdminUser)).toBe(true);
    expect(canAccessAdminArea(mockCustomerUser)).toBe(false);
    expect(canAccessAdminArea(mockAdminUser)).toBe(true);
  });

  it('returns the default home path for each role', () => {
    expect(getHomePathForRole(UserRole.USER)).toBe(APP_ROUTES.customer.home);
    expect(getHomePathForRole(UserRole.ADMIN)).toBe(APP_ROUTES.admin.dashboard);
  });
});
