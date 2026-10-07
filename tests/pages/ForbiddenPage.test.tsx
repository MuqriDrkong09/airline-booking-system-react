import { Route, Routes } from 'react-router-dom';
import { screen } from '@testing-library/react';
import { ForbiddenPage } from '@/pages/ForbiddenPage';
import { renderWithProviders } from '@tests/utils/test-utils';
import {
  mockAdminUser,
  mockCustomerUser,
  resetAuthStore,
  seedAuthenticatedUser,
} from '@tests/utils/authTestUtils';

describe('ForbiddenPage', () => {
  beforeEach(() => {
    resetAuthStore();
  });

  it('redirects unauthenticated visitors to the unauthorized page', () => {
    renderWithProviders(
      <Routes>
        <Route path="/forbidden" element={<ForbiddenPage />} />
        <Route path="/unauthorized" element={<p>Unauthorized page</p>} />
      </Routes>,
      { initialEntries: ['/forbidden'] },
    );

    expect(screen.getByText('Unauthorized page')).toBeInTheDocument();
  });

  it('shows access denied for authenticated users with a role home link', () => {
    seedAuthenticatedUser(mockCustomerUser);

    renderWithProviders(<ForbiddenPage />, {
      initialEntries: ['/forbidden'],
    });

    expect(screen.getByRole('heading', { name: /403/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /go to your home/i })).toHaveAttribute(
      'href',
      '/app',
    );
  });

  it('links admins back to the admin dashboard', () => {
    seedAuthenticatedUser(mockAdminUser);

    renderWithProviders(<ForbiddenPage />, {
      initialEntries: ['/forbidden'],
    });

    expect(screen.getByRole('link', { name: /go to your home/i })).toHaveAttribute(
      'href',
      '/admin',
    );
  });
});
