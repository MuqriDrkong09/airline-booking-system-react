import { Route, Routes } from 'react-router-dom';
import { screen } from '@testing-library/react';
import { RoleRoute } from '@/features/auth';
import { UserRole } from '@/types/auth';
import { renderWithProviders } from '@tests/utils/test-utils';
import {
  mockAdminUser,
  mockCustomerUser,
  resetAuthStore,
  seedAuthenticatedUser,
} from '@tests/utils/authTestUtils';

describe('RoleRoute', () => {
  beforeEach(() => {
    resetAuthStore();
  });

  it('allows matching roles', () => {
    seedAuthenticatedUser(mockAdminUser);

    renderWithProviders(
      <Routes>
        <Route element={<RoleRoute allowedRoles={[UserRole.ADMIN]} />}>
          <Route path="/admin" element={<p>Admin area</p>} />
        </Route>
      </Routes>,
      { initialEntries: ['/admin'] },
    );

    expect(screen.getByText('Admin area')).toBeInTheDocument();
  });

  it('redirects mismatched roles to their home area', () => {
    seedAuthenticatedUser(mockCustomerUser);

    renderWithProviders(
      <Routes>
        <Route element={<RoleRoute allowedRoles={[UserRole.ADMIN]} />}>
          <Route path="/admin" element={<p>Admin area</p>} />
        </Route>
        <Route path="/app" element={<p>Customer home</p>} />
      </Routes>,
      { initialEntries: ['/admin'] },
    );

    expect(screen.getByText('Customer home')).toBeInTheDocument();
    expect(screen.queryByText('Admin area')).not.toBeInTheDocument();
  });
});
