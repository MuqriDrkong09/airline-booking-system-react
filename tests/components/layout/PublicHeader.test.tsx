import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useUiStore } from '@/app/store/uiStore';
import { PublicHeader } from '@/components/layout/PublicHeader';
import { APP_ROUTES } from '@/constants/routes';
import { renderWithProviders } from '@tests/utils/test-utils';
import {
  mockAdminUser,
  mockCustomerUser,
  resetAuthStore,
  seedAuthenticatedUser,
} from '@tests/utils/authTestUtils';

describe('PublicHeader', () => {
  beforeEach(() => {
    useUiStore.setState({ isMobileNavOpen: false, themeMode: 'light' });
    resetAuthStore();
  });

  it('renders guest actions, primary nav, and home branding', () => {
    renderWithProviders(<PublicHeader appName="AeroBook" />);

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'AeroBook home' })).toHaveAttribute(
      'href',
      APP_ROUTES.public.home,
    );
    expect(screen.getByRole('navigation', { name: 'Primary' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute(
      'href',
      APP_ROUTES.public.login,
    );
    expect(screen.getByRole('link', { name: 'Create account' })).toHaveAttribute(
      'href',
      APP_ROUTES.public.register,
    );
    expect(screen.getByRole('button', { name: 'Switch to dark mode' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'My account' })).not.toBeInTheDocument();
  });

  it('opens the mobile menu with guest auth links', async () => {
    const user = userEvent.setup();

    renderWithProviders(<PublicHeader appName="AeroBook" />);

    const menuButton = screen.getByRole('button', { name: 'Open navigation menu' });
    expect(menuButton).toHaveAttribute('aria-expanded', 'false');

    await user.click(menuButton);

    expect(menuButton).toHaveAttribute('aria-expanded', 'true');
    const mobileNav = screen.getByRole('navigation', { name: 'Mobile' });
    expect(within(mobileNav).getByRole('link', { name: 'Sign in' })).toBeInTheDocument();
    expect(within(mobileNav).getByRole('link', { name: 'Create account' })).toBeInTheDocument();
  });

  it('shows My account for an authenticated customer', async () => {
    seedAuthenticatedUser(mockCustomerUser);
    const user = userEvent.setup();

    renderWithProviders(<PublicHeader appName="AeroBook" />);

    const accountLink = screen.getByRole('link', { name: 'My account' });
    expect(accountLink).toHaveAttribute('href', APP_ROUTES.customer.home);
    expect(screen.queryByRole('link', { name: 'Create account' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Open navigation menu' }));
    const mobileNav = screen.getByRole('navigation', { name: 'Mobile' });
    expect(within(mobileNav).getByRole('link', { name: 'My account' })).toHaveAttribute(
      'href',
      APP_ROUTES.customer.home,
    );
  });

  it('shows Admin dashboard for an authenticated admin', async () => {
    seedAuthenticatedUser(mockAdminUser);
    const user = userEvent.setup();

    renderWithProviders(<PublicHeader appName="AeroBook" />);

    const adminLink = screen.getByRole('link', { name: 'Admin dashboard' });
    expect(adminLink).toHaveAttribute('href', APP_ROUTES.admin.dashboard);

    await user.click(screen.getByRole('button', { name: 'Open navigation menu' }));
    const mobileNav = screen.getByRole('navigation', { name: 'Mobile' });
    expect(within(mobileNav).getByRole('link', { name: 'Admin dashboard' })).toHaveAttribute(
      'href',
      APP_ROUTES.admin.dashboard,
    );
  });
});
