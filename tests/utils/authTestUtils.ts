import type { AuthUser } from '@/types/auth';
import { UserRole } from '@/types/auth';
import { useAuthStore } from '@/features/auth';

export const mockCustomerUser: AuthUser = {
  id: 'user-1',
  email: 'user@example.com',
  firstName: 'Alex',
  lastName: 'Traveler',
  role: UserRole.USER,
  emailVerified: true,
};

export const mockAdminUser: AuthUser = {
  id: 'admin-1',
  email: 'admin@example.com',
  firstName: 'Jordan',
  lastName: 'Admin',
  role: UserRole.ADMIN,
  emailVerified: true,
};

export function resetAuthStore(): void {
  useAuthStore.setState({
    user: null,
    accessToken: null,
    status: 'unauthenticated',
    isBootstrapping: false,
    isSubmitting: false,
    error: null,
  });
}

export function seedAuthenticatedUser(
  user: AuthUser,
  accessToken = 'test-access-token',
): void {
  useAuthStore.setState({
    user,
    accessToken,
    status: 'authenticated',
    isBootstrapping: false,
    isSubmitting: false,
    error: null,
  });
}
