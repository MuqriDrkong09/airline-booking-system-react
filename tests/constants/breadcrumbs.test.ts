import { getBreadcrumbsForPath } from '@/constants/breadcrumbs';

describe('getBreadcrumbsForPath', () => {
  it('builds customer breadcrumbs', () => {
    expect(getBreadcrumbsForPath('/app/flights')).toEqual([
      { to: '/app', label: 'Customer' },
      { to: '/app/flights', label: 'Search Flights' },
    ]);
  });

  it('adds a section home crumb for root workspace paths', () => {
    expect(getBreadcrumbsForPath('/admin')).toEqual([
      { to: '/admin', label: 'Admin' },
      { to: '/admin', label: 'Dashboard' },
    ]);
  });
});
