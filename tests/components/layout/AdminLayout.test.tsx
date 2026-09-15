import { Route, Routes } from 'react-router-dom';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useUiStore } from '@/app/store/uiStore';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { renderWithProviders } from '@tests/utils/test-utils';

describe('AdminLayout', () => {
  beforeEach(() => {
    useUiStore.setState({ isMobileNavOpen: false });
  });

  it('renders admin navigation and logout action', async () => {
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

    await user.click(screen.getByRole('button', { name: 'Open user menu' }));
    expect(screen.getByRole('menuitem', { name: 'Log out' })).toBeInTheDocument();
  });
});
