import { Route, Routes } from 'react-router-dom';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

  it('highlights the active public route', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <Routes>
        <Route path="/" element={<AppShell appName="AeroBook" />}>
          <Route index element={<p>Home</p>} />
        </Route>
        <Route path="/app/flights" element={<p>Flights</p>} />
      </Routes>,
      { initialEntries: ['/'] },
    );

    expect(screen.getByRole('link', { name: 'Home' })).toHaveClass('active');
    await user.click(screen.getByRole('link', { name: 'Search Flights' }));
    expect(screen.getByText('Flights')).toBeInTheDocument();
  });
});
