import { Route, Routes } from 'react-router-dom';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserMenu } from '@/components/layout/UserMenu';
import { APP_ROUTES } from '@/constants/routes';
import { renderWithProviders } from '@tests/utils/test-utils';

const demoUser = {
  name: 'Alex Traveler',
  email: 'user@example.com',
  roleLabel: 'Customer',
};

describe('UserMenu', () => {
  it('shows user initials and opens the menu with profile details', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <Routes>
        <Route path="/app" element={<UserMenu user={demoUser} />} />
        <Route path={APP_ROUTES.customer.profile} element={<p>Profile page</p>} />
      </Routes>,
      { initialEntries: ['/app'] },
    );

    const trigger = screen.getByRole('button', { name: 'Open user menu' });
    expect(trigger).toHaveTextContent('AT');
    expect(trigger).not.toHaveAttribute('aria-expanded');

    await user.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('menu', { name: 'User menu' })).toBeInTheDocument();
    expect(screen.getByText('Alex Traveler')).toBeInTheDocument();
    expect(screen.getByText('user@example.com')).toBeInTheDocument();
    expect(screen.getByText('Customer')).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Profile' })).toHaveAttribute(
      'href',
      APP_ROUTES.customer.profile,
    );
  });

  it('uses a custom profile destination and closes when Profile is chosen', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <Routes>
        <Route
          path="/app"
          element={<UserMenu user={demoUser} profileTo={APP_ROUTES.admin.dashboard} />}
        />
        <Route path={APP_ROUTES.admin.dashboard} element={<p>Admin home</p>} />
      </Routes>,
      { initialEntries: ['/app'] },
    );

    await user.click(screen.getByRole('button', { name: 'Open user menu' }));
    const profileItem = screen.getByRole('menuitem', { name: 'Profile' });
    expect(profileItem).toHaveAttribute('href', APP_ROUTES.admin.dashboard);

    await user.click(profileItem);
    expect(screen.getByText('Admin home')).toBeInTheDocument();
  });

  it('calls onLogout and navigates home when Log out is chosen', async () => {
    const user = userEvent.setup();
    const onLogout = jest.fn();

    renderWithProviders(
      <Routes>
        <Route path="/app" element={<UserMenu user={demoUser} onLogout={onLogout} />} />
        <Route path={APP_ROUTES.public.home} element={<p>Public home</p>} />
      </Routes>,
      { initialEntries: ['/app'] },
    );

    await user.click(screen.getByRole('button', { name: 'Open user menu' }));
    await user.click(screen.getByRole('menuitem', { name: 'Log out' }));

    expect(onLogout).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Public home')).toBeInTheDocument();
  });

  it('logs out without an onLogout handler and supports short names', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <Routes>
        <Route
          path="/app"
          element={
            <UserMenu
              user={{ name: 'Jordan', email: 'admin@example.com', roleLabel: 'Administrator' }}
            />
          }
        />
        <Route path={APP_ROUTES.public.home} element={<p>Signed out home</p>} />
      </Routes>,
      { initialEntries: ['/app'] },
    );

    expect(screen.getByRole('button', { name: 'Open user menu' })).toHaveTextContent('J');

    await user.click(screen.getByRole('button', { name: 'Open user menu' }));
    await user.click(screen.getByRole('menuitem', { name: 'Log out' }));

    expect(screen.getByText('Signed out home')).toBeInTheDocument();
  });

  it('builds initials from the first two non-empty name parts', () => {
    renderWithProviders(
      <UserMenu
        user={{
          name: '  Ada   Lovelace  Extra',
          email: 'ada@example.com',
          roleLabel: 'Customer',
        }}
      />,
    );

    expect(screen.getByRole('button', { name: 'Open user menu' })).toHaveTextContent('AL');
  });
});
