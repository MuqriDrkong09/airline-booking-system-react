import { Route, Routes } from 'react-router-dom';
import { screen } from '@testing-library/react';
import { AppBreadcrumbs } from '@/components/layout/AppBreadcrumbs';
import { renderWithProviders } from '@tests/utils/test-utils';

function renderAt(path: string) {
  return renderWithProviders(
    <Routes>
      <Route path="*" element={<AppBreadcrumbs />} />
    </Routes>,
    { initialEntries: [path] },
  );
}

describe('AppBreadcrumbs', () => {
  it('renders nothing when the path has no breadcrumb crumbs', () => {
    const { container } = renderAt('/unknown/path');

    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByRole('navigation', { name: 'Breadcrumb' })).not.toBeInTheDocument();
  });

  it('renders parent links and the current page as plain text', () => {
    renderAt('/app/flights');

    const nav = screen.getByRole('navigation', { name: 'Breadcrumb' });
    expect(nav).toBeInTheDocument();

    const customerLink = screen.getByRole('link', { name: 'Customer' });
    expect(customerLink).toHaveAttribute('href', '/app');

    expect(screen.getByText('Search Flights')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Search Flights' })).not.toBeInTheDocument();
  });

  it('renders dynamic booking-step breadcrumbs with links for earlier steps', () => {
    renderAt('/app/flights/FL-100/passengers');

    expect(screen.getByRole('link', { name: 'Customer' })).toHaveAttribute('href', '/app');
    expect(screen.getByRole('link', { name: 'Search Flights' })).toHaveAttribute(
      'href',
      '/app/flights',
    );
    expect(screen.getByRole('link', { name: 'Flight details' })).toHaveAttribute(
      'href',
      '/app/flights/FL-100',
    );
    expect(screen.getByText('Passengers')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Passengers' })).not.toBeInTheDocument();
  });
});
