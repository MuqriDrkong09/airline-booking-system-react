import { Route, Routes } from 'react-router-dom';
import { screen } from '@testing-library/react';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { renderWithProviders } from '@tests/utils/test-utils';
import { resetAuthStore } from '@tests/utils/authTestUtils';

describe('PublicLayout', () => {
  beforeEach(() => {
    resetAuthStore();
  });

  it('renders public landmarks and primary navigation', () => {
    renderWithProviders(
      <Routes>
        <Route path="/" element={<PublicLayout appName="AeroBook" />}>
          <Route index element={<p>Marketing home</p>} />
        </Route>
      </Routes>,
      { initialEntries: ['/'] },
    );

    expect(screen.getByRole('link', { name: 'Skip to main content' })).toBeInTheDocument();
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveTextContent('Marketing home');
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Create account' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sign in' })).toBeInTheDocument();
  });
});
