import { Route, Routes } from 'react-router-dom';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useUiStore } from '@/app/store/uiStore';
import { CustomerLayout } from '@/components/layout/CustomerLayout';
import { renderWithProviders } from '@tests/utils/test-utils';
import {
  mockCustomerUser,
  resetAuthStore,
  seedAuthenticatedUser,
} from '@tests/utils/authTestUtils';

describe('CustomerLayout', () => {
  beforeEach(() => {
    useUiStore.setState({ isMobileNavOpen: false });
    resetAuthStore();
    seedAuthenticatedUser(mockCustomerUser);
  });

  it('renders customer navigation, breadcrumbs, and page content', () => {
    renderWithProviders(
      <Routes>
        <Route path="/app" element={<CustomerLayout appName="AeroBook" />}>
          <Route path="flights" element={<p>Flights content</p>} />
        </Route>
      </Routes>,
      { initialEntries: ['/app/flights'] },
    );

    expect(screen.getByRole('navigation', { name: 'Customer' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Search Flights' })).toHaveClass('active');
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toHaveTextContent(
      /Customer.*Search Flights/,
    );
    expect(screen.getByRole('main')).toHaveTextContent('Flights content');
    expect(screen.getByRole('button', { name: 'Open user menu' })).toBeInTheDocument();
  });

  it('opens the mobile drawer navigation', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <Routes>
        <Route path="/app" element={<CustomerLayout appName="AeroBook" />}>
          <Route index element={<p>Home</p>} />
        </Route>
      </Routes>,
      { initialEntries: ['/app'] },
    );

    await user.click(screen.getByRole('button', { name: 'Open navigation menu' }));

    const mobileNav = screen.getByRole('navigation', { name: 'Customer mobile' });
    expect(mobileNav).toBeInTheDocument();
    expect(within(mobileNav).getByRole('link', { name: 'My Bookings' })).toBeInTheDocument();
  });
});
