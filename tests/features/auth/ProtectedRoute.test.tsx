import { Route, Routes } from 'react-router-dom';
import { screen } from '@testing-library/react';
import { ProtectedRoute, useAuthStore } from '@/features/auth';
import { renderWithProviders } from '@tests/utils/test-utils';
import {
  mockCustomerUser,
  resetAuthStore,
  seedAuthenticatedUser,
} from '@tests/utils/authTestUtils';

describe('ProtectedRoute', () => {
  beforeEach(() => {
    resetAuthStore();
  });

  it('redirects unauthenticated users to login', () => {
    renderWithProviders(
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/app" element={<p>Protected content</p>} />
        </Route>
        <Route path="/login" element={<p>Login page</p>} />
      </Routes>,
      { initialEntries: ['/app'] },
    );

    expect(screen.getByText('Login page')).toBeInTheDocument();
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
  });

  it('renders child routes when authenticated', () => {
    seedAuthenticatedUser(mockCustomerUser);

    renderWithProviders(
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/app" element={<p>Protected content</p>} />
        </Route>
        <Route path="/login" element={<p>Login page</p>} />
      </Routes>,
      { initialEntries: ['/app'] },
    );

    expect(screen.getByText('Protected content')).toBeInTheDocument();
  });

  it('shows a loader while restoring the session', () => {
    useAuthStore.setState({ isBootstrapping: true, status: 'idle' });

    renderWithProviders(
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/app" element={<p>Protected content</p>} />
        </Route>
      </Routes>,
      { initialEntries: ['/app'] },
    );

    expect(screen.getByText(/Checking authentication/i)).toBeInTheDocument();
  });
});
