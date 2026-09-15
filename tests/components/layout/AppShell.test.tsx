import { Route, Routes } from 'react-router-dom';
import { screen } from '@testing-library/react';
import { AppShell } from '@/components/layout/AppShell';
import { renderWithProviders } from '@tests/utils/test-utils';

describe('AppShell', () => {
  it('renders the application landmarks and navigation', () => {
    renderWithProviders(
      <Routes>
        <Route path="/" element={<AppShell appName="AeroBook" />}>
          <Route index element={<p>Home content</p>} />
        </Route>
      </Routes>,
    );

    expect(screen.getByRole('link', { name: 'Skip to main content' })).toBeInTheDocument();
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveTextContent('Home content');
    expect(screen.getByRole('contentinfo')).toHaveTextContent('AeroBook');
  });
});
