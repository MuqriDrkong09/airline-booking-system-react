import { Route, Routes } from 'react-router-dom';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { UserMenu } from '@/components/layout/UserMenu';
import type { DemoUser } from '@/constants/demoUser';
import { APP_ROUTES } from '@/constants/routes';
import { renderWithProviders } from '@tests/utils/test-utils';

const demoUser: DemoUser = {
  name: 'Alex Traveler',
  email: 'user@example.com',
  roleLabel: 'Customer',
};

function renderUserMenu(
  ui: ReactElement,
  options?: { initialEntries?: string[] },
) {
  return renderWithProviders(ui, {
    initialEntries: options?.initialEntries ?? ['/app'],
  });
}

describe('UserMenu', () => {
  it('shows user initials and opens the menu with profile details', async () => {
    const user = userEvent.setup();

    renderUserMenu(
      <Routes>
        <Route path="/app" element={<UserMenu user={demoUser} />} />
        <Route path={APP_ROUTES.customer.profile} element={<p>Profile page</p>} />
      </Routes>,
    );

    const trigger = screen.getByRole('button', { name: 'Open user menu' });
    expect(trigger).toHaveTextContent('AT');
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    expect(trigger).not.toHaveAttribute('aria-expanded');
    expect(trigger).not.toHaveAttribute('aria-controls');

    await user.click(trigger);

    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(trigger).toHaveAttribute('aria-controls');

    const menu = screen.getByRole('menu', { name: 'User menu' });
    expect(menu).toBeInTheDocument();
    expect(trigger.getAttribute('aria-controls')).toBeTruthy();

    expect(within(menu).getByText('Alex Traveler')).toBeInTheDocument();
    expect(within(menu).getByText('user@example.com')).toBeInTheDocument();
    expect(within(menu).getByText('Customer')).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'Profile' })).toHaveAttribute(
      'href',
      APP_ROUTES.customer.profile,
    );
    expect(screen.getByRole('menuitem', { name: 'Log out' })).toBeInTheDocument();
  });

  it('closes the menu on Escape without navigating away', async () => {
    const user = userEvent.setup();

    renderUserMenu(
      <Routes>
        <Route path="/app" element={<UserMenu user={demoUser} />} />
        <Route path={APP_ROUTES.customer.profile} element={<p>Profile page</p>} />
      </Routes>,
    );

    const trigger = screen.getByRole('button', { name: 'Open user menu' });
    await user.click(trigger);
    expect(screen.getByRole('menu', { name: 'User menu' })).toBeInTheDocument();

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('menu', { name: 'User menu' })).not.toBeInTheDocument();
    expect(trigger).not.toHaveAttribute('aria-expanded');
    expect(trigger).not.toHaveAttribute('aria-controls');
    expect(screen.queryByText('Profile page')).not.toBeInTheDocument();
  });

  it('uses the default profile route when profileTo is omitted', async () => {
    const user = userEvent.setup();

    renderUserMenu(
      <Routes>
        <Route path="/app" element={<UserMenu user={demoUser} />} />
        <Route path={APP_ROUTES.customer.profile} element={<p>Default profile</p>} />
      </Routes>,
    );

    await user.click(screen.getByRole('button', { name: 'Open user menu' }));
    const profileItem = screen.getByRole('menuitem', { name: 'Profile' });
    expect(profileItem).toHaveAttribute('href', APP_ROUTES.customer.profile);

    await user.click(profileItem);
    expect(screen.getByText('Default profile')).toBeInTheDocument();
  });

  it('uses a custom profile destination and closes when Profile is chosen', async () => {
    const user = userEvent.setup();

    renderUserMenu(
      <Routes>
        <Route
          path="/app"
          element={<UserMenu user={demoUser} profileTo={APP_ROUTES.admin.dashboard} />}
        />
        <Route path={APP_ROUTES.admin.dashboard} element={<p>Admin home</p>} />
      </Routes>,
    );

    await user.click(screen.getByRole('button', { name: 'Open user menu' }));
    const profileItem = screen.getByRole('menuitem', { name: 'Profile' });
    expect(profileItem).toHaveAttribute('href', APP_ROUTES.admin.dashboard);

    await user.click(profileItem);
    expect(screen.getByText('Admin home')).toBeInTheDocument();
    expect(screen.queryByRole('menu', { name: 'User menu' })).not.toBeInTheDocument();
  });

  it('calls onLogout and navigates home when Log out is chosen', async () => {
    const user = userEvent.setup();
    const onLogout = jest.fn();

    renderUserMenu(
      <Routes>
        <Route path="/app" element={<UserMenu user={demoUser} onLogout={onLogout} />} />
        <Route path={APP_ROUTES.public.home} element={<p>Public home</p>} />
      </Routes>,
    );

    await user.click(screen.getByRole('button', { name: 'Open user menu' }));
    await user.click(screen.getByRole('menuitem', { name: 'Log out' }));

    expect(onLogout).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Public home')).toBeInTheDocument();
    expect(screen.queryByRole('menu', { name: 'User menu' })).not.toBeInTheDocument();
  });

  it('logs out without an onLogout handler and supports a single-name initial', async () => {
    const user = userEvent.setup();

    renderUserMenu(
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
    );

    expect(screen.getByRole('button', { name: 'Open user menu' })).toHaveTextContent('J');

    await user.click(screen.getByRole('button', { name: 'Open user menu' }));
    expect(screen.getByText('Administrator')).toBeInTheDocument();
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

  it('renders an empty avatar when the name has no usable parts', () => {
    renderWithProviders(
      <UserMenu
        user={{
          name: '   ',
          email: 'empty@example.com',
          roleLabel: 'Customer',
        }}
      />,
    );

    const trigger = screen.getByRole('button', { name: 'Open user menu' });
    expect(trigger.textContent?.replace(/\s/g, '')).toBe('');
  });

  it('lowercases name parts are uppercased in the avatar initials', () => {
    renderWithProviders(
      <UserMenu
        user={{
          name: 'ada lovelace',
          email: 'ada@example.com',
          roleLabel: 'Customer',
        }}
      />,
    );

    expect(screen.getByRole('button', { name: 'Open user menu' })).toHaveTextContent('AL');
  });

  it('can reopen the menu after it was closed', async () => {
    const user = userEvent.setup();

    renderUserMenu(
      <Routes>
        <Route path="/app" element={<UserMenu user={demoUser} />} />
      </Routes>,
    );

    const trigger = screen.getByRole('button', { name: 'Open user menu' });

    await user.click(trigger);
    expect(screen.getByRole('menu', { name: 'User menu' })).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('menu', { name: 'User menu' })).not.toBeInTheDocument();

    await user.click(trigger);
    expect(screen.getByRole('menu', { name: 'User menu' })).toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });
});
