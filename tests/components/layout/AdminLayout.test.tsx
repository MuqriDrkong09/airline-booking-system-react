import { Route, Routes } from 'react-router-dom';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useUiStore } from '@/app/store/uiStore';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useAuthStore } from '@/features/auth';
import { renderWithProviders } from '@tests/utils/test-utils';
import {
  mockAdminUser,
  resetAuthStore,
  seedAuthenticatedUser,
} from '@tests/utils/authTestUtils';

describe('AdminLayout', () => {
  beforeEach(() => {
    useUiStore.setState({ isMobileNavOpen: false });
    resetAuthStore();
  });

  it('renders nothing when there is no authenticated user', () => {
    const { container } = renderWithProviders(
      <Routes>
        <Route path="/admin" element={<AdminLayout appName="AeroBook" />}>
          <Route index element={<p>Dashboard content</p>} />
        </Route>
      </Routes>,
      { initialEntries: ['/admin'] },
    );

    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByRole('navigation', { name: 'Admin' })).not.toBeInTheDocument();
  });

  it('renders admin navigation and page content for an authenticated admin', async () => {
    seedAuthenticatedUser(mockAdminUser);
    const user = userEvent.setup();

    renderWithProviders(
      <Routes>
        <Route path="/admin" element={<AdminLayout appName="AeroBook" />}>
          <Route index element={<p>Dashboard content</p>} />
        </Route>
        <Route path="/" element={<p>Public home</p>} />
      </Routes>,
      { initialEntries: ['/admin'] },
    );

    expect(screen.getByRole('navigation', { name: 'Admin' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveClass('active');
    expect(screen.getByRole('main')).toHaveTextContent('Dashboard content');
    expect(screen.getByRole('link', { name: 'Promo Codes' })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toHaveTextContent(
      /Admin.*Dashboard/,
    );
    expect(screen.getByText('AeroBook')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Admin' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Open user menu' }));
    expect(screen.getByRole('menuitem', { name: 'Log out' })).toBeInTheDocument();
  });

  it('calls logout when Log out is chosen from the user menu', async () => {
    seedAuthenticatedUser(mockAdminUser);
    const user = userEvent.setup();
    const logoutSpy = jest
      .spyOn(useAuthStore.getState(), 'logout')
      .mockResolvedValue(undefined);

    renderWithProviders(
      <Routes>
        <Route path="/admin" element={<AdminLayout appName="AeroBook" />}>
          <Route index element={<p>Dashboard content</p>} />
        </Route>
        <Route path="/" element={<p>Public home</p>} />
      </Routes>,
      { initialEntries: ['/admin'] },
    );

    await user.click(screen.getByRole('button', { name: 'Open user menu' }));
    await user.click(screen.getByRole('menuitem', { name: 'Log out' }));

    expect(logoutSpy).toHaveBeenCalledTimes(1);
    logoutSpy.mockRestore();
  });
});
