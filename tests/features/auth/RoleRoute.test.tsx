import { Route, Routes } from 'react-router-dom';
import { screen } from '@testing-library/react';
import { RoleRoute, useAuthStore } from '@/features/auth';
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

  it('redirects unauthenticated users to login', () => {
    renderWithProviders(
      <Routes>
        <Route element={<RoleRoute allowedRoles={[UserRole.ADMIN]} />}>
          <Route path="/admin" element={<p>Admin area</p>} />
        </Route>
        <Route path="/login" element={<p>Login page</p>} />
      </Routes>,
      { initialEntries: ['/admin'] },
    );

    expect(screen.getByText('Login page')).toBeInTheDocument();
    expect(screen.queryByText('Admin area')).not.toBeInTheDocument();
  });

  it('redirects when authenticated status has no user', () => {
    useAuthStore.setState({
      user: null,
      accessToken: 'token',
      status: 'authenticated',
      isBootstrapping: false,
    });

    renderWithProviders(
      <Routes>
        <Route element={<RoleRoute allowedRoles={[UserRole.USER]} />}>
          <Route path="/app" element={<p>Customer area</p>} />
        </Route>
        <Route path="/login" element={<p>Login page</p>} />
      </Routes>,
      { initialEntries: ['/app'] },
    );

    expect(screen.getByText('Login page')).toBeInTheDocument();
    expect(screen.queryByText('Customer area')).not.toBeInTheDocument();
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

  it('redirects mismatched customer roles to the customer home', () => {
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

  it('redirects mismatched admin roles to the admin dashboard', () => {
    seedAuthenticatedUser(mockAdminUser);

    renderWithProviders(
      <Routes>
        <Route element={<RoleRoute allowedRoles={[UserRole.USER]} />}>
          <Route path="/app" element={<p>Customer area</p>} />
        </Route>
        <Route path="/admin" element={<p>Admin dashboard</p>} />
      </Routes>,
      { initialEntries: ['/app'] },
    );

    expect(screen.getByText('Admin dashboard')).toBeInTheDocument();
    expect(screen.queryByText('Customer area')).not.toBeInTheDocument();
  });
});
