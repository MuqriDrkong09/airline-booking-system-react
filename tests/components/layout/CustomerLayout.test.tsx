import { Route, Routes } from 'react-router-dom';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useUiStore } from '@/app/store/uiStore';
import { CustomerLayout } from '@/components/layout/CustomerLayout';
import { useAuthStore } from '@/features/auth';
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
  });

  it('renders nothing when there is no authenticated user', () => {
    const { container } = renderWithProviders(
      <Routes>
        <Route path="/app" element={<CustomerLayout appName="AeroBook" />}>
          <Route index element={<p>Home</p>} />
        </Route>
      </Routes>,
      { initialEntries: ['/app'] },
    );

    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByRole('navigation', { name: 'Customer' })).not.toBeInTheDocument();
  });

  it('renders customer navigation, breadcrumbs, and page content', () => {
    seedAuthenticatedUser(mockCustomerUser);

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
    expect(screen.getByText('AeroBook')).toBeInTheDocument();
  });

  it('opens the mobile drawer navigation', async () => {
    seedAuthenticatedUser(mockCustomerUser);
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

  it('calls logout when Log out is chosen from the user menu', async () => {
    seedAuthenticatedUser(mockCustomerUser);
    const user = userEvent.setup();
    const logoutSpy = jest
      .spyOn(useAuthStore.getState(), 'logout')
      .mockResolvedValue(undefined);

    renderWithProviders(
      <Routes>
        <Route path="/app" element={<CustomerLayout appName="AeroBook" />}>
          <Route index element={<p>Home</p>} />
        </Route>
        <Route path="/" element={<p>Public home</p>} />
      </Routes>,
      { initialEntries: ['/app'] },
    );

    await user.click(screen.getByRole('button', { name: 'Open user menu' }));
    await user.click(screen.getByRole('menuitem', { name: 'Log out' }));

    expect(logoutSpy).toHaveBeenCalledTimes(1);
    logoutSpy.mockRestore();
  });
});
