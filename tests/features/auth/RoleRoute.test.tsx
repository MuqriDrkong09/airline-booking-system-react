import { Route, Routes } from 'react-router-dom';
import { screen } from '@testing-library/react';
import {
  AdminRoute,
  CustomerRoute,
  RoleRoute,
  useAuthStore,
} from '@/features/auth';
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

  it('shows the 403 page when the role is not allowed', () => {
    seedAuthenticatedUser(mockCustomerUser);

    renderWithProviders(
      <Routes>
        <Route element={<RoleRoute allowedRoles={[UserRole.ADMIN]} />}>
          <Route path="/admin" element={<p>Admin area</p>} />
        </Route>
        <Route path="/forbidden" element={<p>403 page</p>} />
      </Routes>,
      { initialEntries: ['/admin'] },
    );

    expect(screen.getByText('403 page')).toBeInTheDocument();
    expect(screen.queryByText('Admin area')).not.toBeInTheDocument();
  });

  it('shows a loader while restoring the session', () => {
    useAuthStore.setState({ isBootstrapping: true, status: 'idle' });

    renderWithProviders(
      <Routes>
        <Route element={<RoleRoute allowedRoles={[UserRole.ADMIN]} />}>
          <Route path="/admin" element={<p>Admin area</p>} />
        </Route>
      </Routes>,
      { initialEntries: ['/admin'] },
    );

    expect(screen.getByText(/Checking authorization/i)).toBeInTheDocument();
  });
});

describe('CustomerRoute', () => {
  beforeEach(() => {
    resetAuthStore();
  });

  it('allows USER and ADMIN into the customer area', () => {
    seedAuthenticatedUser(mockCustomerUser);

    const { unmount } = renderWithProviders(
      <Routes>
        <Route element={<CustomerRoute />}>
          <Route path="/app" element={<p>Customer area</p>} />
        </Route>
      </Routes>,
      { initialEntries: ['/app'] },
    );

    expect(screen.getByText('Customer area')).toBeInTheDocument();
    unmount();

    seedAuthenticatedUser(mockAdminUser);
    renderWithProviders(
      <Routes>
        <Route element={<CustomerRoute />}>
          <Route path="/app" element={<p>Customer area</p>} />
        </Route>
      </Routes>,
      { initialEntries: ['/app'] },
    );

    expect(screen.getByText('Customer area')).toBeInTheDocument();
  });
});

describe('AdminRoute', () => {
  beforeEach(() => {
    resetAuthStore();
  });

  it('allows ADMIN and blocks USER with 403', () => {
    seedAuthenticatedUser(mockAdminUser);

    const { unmount } = renderWithProviders(
      <Routes>
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<p>Admin area</p>} />
        </Route>
      </Routes>,
      { initialEntries: ['/admin'] },
    );

    expect(screen.getByText('Admin area')).toBeInTheDocument();
    unmount();

    seedAuthenticatedUser(mockCustomerUser);
    renderWithProviders(
      <Routes>
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<p>Admin area</p>} />
        </Route>
        <Route path="/forbidden" element={<p>403 page</p>} />
      </Routes>,
      { initialEntries: ['/admin'] },
    );

    expect(screen.getByText('403 page')).toBeInTheDocument();
    expect(screen.queryByText('Admin area')).not.toBeInTheDocument();
  });
});
